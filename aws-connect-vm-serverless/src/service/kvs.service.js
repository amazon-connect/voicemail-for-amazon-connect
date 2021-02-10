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
const lambda = new AWS.Lambda();

class KvsService {

    constructor() {
        this.transcriptionFunctionArn = process.env.TRANSCRIPTION_FUNCTION_ARN;
    }

    processAmazonConnectEvent(event, callback) {

        let payload = this.getPayloadFromEvent(event);

        const params = {
            FunctionName: this.transcriptionFunctionArn,
            InvokeArgs: JSON.stringify(payload)
        };

        lambda.invokeAsync(params, (err, data) => {
            if (err) {
                throw (err);
            } else {
                if (callback) {
                    callback();
                } else {
                    console.log('nothing to callback so letting it go');
                }
            }
        });

        if (callback) {
            callback();
        }
    }

    getPayloadFromEvent(event) {
        let payload = "";
        if (event.eventType) {
            payload = {
                inputFileName: "keepWarm.wav",
                connectContactId: "12b87d2b-keepWarm",
                transcriptionEnabled: "false"
            };
        } else {
            payload = {
                streamARN: event.Details.ContactData.MediaStreams.Customer.Audio.StreamARN,
                startFragmentNum: event.Details.ContactData.MediaStreams.Customer.Audio.StartFragmentNumber,
                connectContactId: event.Details.ContactData.ContactId,
                connectContactPhoneNumber: event.Details.ContactData.CustomerEndpoint.Address,
                transcriptionEnabled: event.Details.ContactData.Attributes.transcribeVoicemail === "true",
                encryptionEnabled: event.Details.ContactData.Attributes.encryptVoicemail === "true",
                saveCallRecording: event.Details.ContactData.Attributes.saveCallRecording === "true",
                languageCode: event.Details.ContactData.Attributes.languageCode === "es-US" ? "es-US" : "en-US",
                agentId: event.Details.ContactData.Attributes.agentId,
                agentExtensionNumber: event.Details.ContactData.Attributes.extensionNumber,
                agentName: event.Details.ContactData.Attributes.agentName
            };
        }
        return payload;
    }

}

export {KvsService};