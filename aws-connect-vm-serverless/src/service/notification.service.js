/******************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved. 
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at                                                            
 *                                                                              
 *      http://www.apache.org/licenses/                                        
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.                                              
******************************************************************************/

const AWS = require('aws-sdk');
import nodemailer from 'nodemailer';


class DeliveryOptionSettings {
    constructor(transcribe, encrypt) {
        this.transcribe = transcribe;
        this.encrypt = encrypt;
    }
}

class DeliveryContent {
    constructor(transcription, preSignedUrl, audioFile) {
        this.transcription = transcription;
        this.preSignedUrl = preSignedUrl;
        this.audioFile = audioFile;
    }
}

class NotificationService {

    constructor(s3Service, transcriptionService) {
        this.s3Service = s3Service;
        this.transcriptionService = transcriptionService;
        this.ses = new AWS.SES();
        this.sns = new AWS.SNS();
        this.transporter = nodemailer.createTransport({SES: this.ses});
        this.recordingExpiration = parseInt(process.env.SIGNED_RECORDING_URL_EXP)
    }

    /**
     *
     * @param {GlobalSettings} globalSettings
     * @param {ContactVoicemail} voicemail
     * @param {ConnectAgent} connectAgent
     * @return {Promise<Object>}
     */
    deliver(globalSettings, voicemail, connectAgent) {
        let options = this.getTranscribeAndEncryptionSettings(globalSettings, voicemail);
        let deliveryOptions = connectAgent.agent.deliveryOptions;
        let shouldSendEmail = deliveryOptions.email;
        let shouldSendSMS = deliveryOptions.sms.enabled;
        let contactEmail = connectAgent.connectUser.email || connectAgent.connectUser.username; // For SSO instances
        let agentSMSPhoneNumber = deliveryOptions.sms.phoneNumber;
        let deliveryEmail = globalSettings.deliveryEmail;

        if (!deliveryEmail) {
            throw "You must provide a delivery email";
        }

        if (!shouldSendEmail && !shouldSendSMS) {
            console.log("NOT sending email or sms");
            return Promise.resolve({message: "Not sending Email or SNS"});
        } else {
            if (shouldSendEmail && shouldSendSMS) {
                console.log(`Should Send BOTH email and SMS`);
                return this.getDeliveryContents(options, voicemail).then(contents => {
                    return this.sendTextMessage(voicemail, agentSMSPhoneNumber, contents)
                        .then(() => this.sendMail(voicemail, deliveryEmail, contactEmail, contents));
                });
            } else if (shouldSendSMS && agentSMSPhoneNumber) {
                console.log("Send ONLY SMS");
                return this.getDeliveryContents(options, voicemail).then(contents => {
                    return this.sendTextMessage(voicemail, agentSMSPhoneNumber, contents);
                });
            } else if (deliveryOptions.email) {
                console.log("Send ONLY Email");
                return this.getDeliveryContents(options, voicemail).then(contents => {
                    return this.sendMail(voicemail, deliveryEmail, contactEmail, contents);
                });
            } else {
                return Promise.resolve({message: "Undeliverable"});
            }
        }
    }

    /**
     * @param {ContactVoicemail} voicemail
     * @param {DeliveryOptionSettings} options
     * @returns {Promise<DeliveryContent>}
     */
    getDeliveryContents(options, voicemail) {
        console.log("Getting Delivery Contents");

        let transcriptionPromise = Promise.resolve(null);
        let preSignedUrlPromise = Promise.resolve(null);
        let audioFilePromise = Promise.resolve(null);

        if (options.encrypt) {
            console.log("Encrypt...");
            preSignedUrlPromise = this.s3Service.getPreSignedUrl(voicemail.recordingBucketName, voicemail.recordingObjectKey, this.recordingExpiration);
        } else {
            console.log("Unencrypted...");
            audioFilePromise = this.s3Service.getFile(voicemail.recordingBucketName, voicemail.recordingObjectKey);
        }

        if (options.transcribe) {
            console.log("Transcribe...");
            let jobName = voicemail.getTranscriptJobName();
            transcriptionPromise = this.transcriptionService.getTranscriptForJobName(jobName);
        }

        return Promise
            .all([transcriptionPromise, preSignedUrlPromise, audioFilePromise])
            .then(result => {
                let transcription = result[0];
                let preSignedUrl = result[1];
                let audioFile = result[2];
                return new DeliveryContent(transcription, preSignedUrl, audioFile);
            });
    }

    /**
     *
     * @param {ContactVoicemail} voicemail
     * @param {string} fromEmailAddress
     * @param {string} toEmailAddress
     * @param {DeliveryContent} deliveryContent
     */
    sendMail(voicemail, fromEmailAddress, toEmailAddress, deliveryContent) {
        return new Promise((resolve, reject) => {
            let voicemailDate = new Date(voicemail.timestamp * 1000);

            // Date
            let html = `<p>${voicemailDate}</p>`;
            html += `<p>New voicemail from ${voicemail.contactPhoneNumber}.</p>`;

            // Transcript
            if (deliveryContent.transcription) {
                html += `<b>Voicemail Transcript:</b><p>${deliveryContent.transcription.transcripts[0].transcript}</p>`;
            }

            // Voicemail
            html += `<b>Voicemail:</b>`;
            if (deliveryContent.preSignedUrl) {
                // Expiration Date
                let expirationDate = new Date(Math.floor((Date.now() / 1000) + deliveryContent.preSignedUrl.expires) * 1000);
                html += `<p>Voicemail Expiration Date: ${expirationDate}</p>`;

                // Audio Link
                let audioLink = `<p><a href="${deliveryContent.preSignedUrl.url}">Click Here</a> to listen to the voicemail</p>`;
                html += audioLink;
            }

            let mailOptions = {
                from: fromEmailAddress,
                subject: `New voicemail from ${voicemail.contactPhoneNumber}`,
                html,
                to: toEmailAddress
            };

            // Audio Attachment
            if (deliveryContent.audioFile) {
                mailOptions["attachments"] = [{
                    filename: "voicemail.wav",
                    content: deliveryContent.audioFile.Body
                }];
            }

            this.transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                resolve(info);
            });
        });
    }

    /**
     *
     * @param {ContactVoicemail} voicemail
     * @param {string} deliveryPhoneNumber
     * @param {DeliveryContent} deliveryContent
     */
    sendTextMessage(voicemail, deliveryPhoneNumber, deliveryContent) {
        return new Promise((resolve, reject) => {

            let message = `Amazon Connect voicemail from ${voicemail.contactPhoneNumber}\n`;

            // Transcript
            if (deliveryContent.transcription) {
                message += `\nTranscript: "${deliveryContent.transcription.transcripts[0].transcript}"\n`;
            }

            if (deliveryContent.preSignedUrl) {
                // Expiration Date
                let expirationDate = new Date(Math.floor((Date.now() / 1000) + deliveryContent.preSignedUrl.expires) * 1000);
                message += `\nVoicemail Expiration Date: ${expirationDate}\n`;

                // Audio Link
                let audioLink = `${deliveryContent.preSignedUrl.url}`;
                message += audioLink;
            }

            let params = {
                Message: message,
                PhoneNumber: deliveryPhoneNumber
            };

            this.sns.publish(params, (err, data) => {
                if (err) {
                    console.log(`Error: ${err}`);
                }
                resolve(data);
            });
        });

    }

    /**
     *
     * @param {GlobalSettings} globalSettings
     * @param {ContactVoicemail} voicemail
     * @returns DeliveryOptionSettings
     */
    getTranscribeAndEncryptionSettings(globalSettings, voicemail) {
        let transcribe = false;
        let encrypt = true;

        if (globalSettings.transcribeVoicemail === true) {
            transcribe = voicemail.shouldTranscribe;
        }

        if (globalSettings.encryptVoicemail === false) {
            encrypt = voicemail.shouldEncrypt;
        }

        return new DeliveryOptionSettings(transcribe, encrypt);
    }

}

export {NotificationService, DeliveryOptionSettings};
