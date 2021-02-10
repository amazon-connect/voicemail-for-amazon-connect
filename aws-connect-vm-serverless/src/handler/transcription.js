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

import {ContactVoicemailRepo} from "../repo/voicemail.repo";
import {ContactVoicemailService} from "../service/voicemail.service";
import {ConnectAgentService} from "../service/connect-agent.service";
import {ConnectService} from "../service/connect.service";
import {UsersRepo} from "../repo/users-repo";
import {NotificationService} from "../service/notification.service";
import {S3Service} from "../service/s3.service";
import {TranscriptionService} from "../service/transcription.service";
import {GlobalSettingsService} from "../service/global-settings.services";
import {GlobalRepo} from "../repo/global-repo";

const usersRepo = new UsersRepo();
const globalRepo = new GlobalRepo();
const globalSettingsService = new GlobalSettingsService(globalRepo);
const notificationService = new NotificationService(new S3Service(), new TranscriptionService());
const agentService = new ConnectAgentService(new ConnectService(), usersRepo);
const voicemailRepo = new ContactVoicemailRepo();
const voicemailService = new ContactVoicemailService(voicemailRepo, agentService, notificationService, globalSettingsService);

exports.process = async(event, context) => {
    let {detail} = event;
    let jobName = detail["TranscriptionJobName"];
    let jobStatus = detail["TranscriptionJobStatus"];
    try {
        let result = await voicemailService.updateVoicemailTranscriptStatus(jobName, jobStatus);
        return {
            lambdaResult: "Success"
        };
    } catch (err) {
        console.trace();
        console.log("Error Processing Transcript. Error: ", JSON.stringify(err, null, 2));
    }
};