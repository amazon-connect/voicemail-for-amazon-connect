/******************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *                                                                                                                   *
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at                                                            
 *                                                                                                                   
 *      http://www.apache.org/licenses/                                                                                   *                                                                                                                  
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.                                                                                
******************************************************************************/

import {NotificationService} from "../service/notification.service";

const AWS = require("aws-sdk");

import {ConnectAgentService} from "../service/connect-agent.service";
import {ContactVoicemailRepo} from "../repo/voicemail.repo";
import {ContactVoicemailService} from "../service/voicemail.service";
import {UsersRepo} from "../repo/users-repo";
import {ConnectService} from "../service/connect.service";
import {S3Service} from "../service/s3.service";
import {TranscriptionService} from "../service/transcription.service";
import {GlobalSettingsService} from "../service/global-settings.services";
import {GlobalRepo} from "../repo/global-repo";

const usersRepo = new UsersRepo();
const globalRepo = new GlobalRepo();
const voicemailService = new ContactVoicemailService(
    new ContactVoicemailRepo(),
    new ConnectAgentService(new ConnectService(), usersRepo),
    new NotificationService(new S3Service(), new TranscriptionService()),
    new GlobalSettingsService(globalRepo)
);

exports.stream = async (event, context) => {
    let {Records} = event;
    let promises = Records.map(async (record) => {
        let eventName = record.eventName;
        let newRecord = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        let oldRecord = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
        return await voicemailService.processVoicemailRecords(eventName, newRecord, oldRecord);
    });

    try {
        let result = await Promise.all(promises);
        return {
            lambdaResult: "Success"
        };
    } catch (err) {
        console.log(err);
        return {
            error: err
        };
    }
};