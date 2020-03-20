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

class ContactVoicemail {

    constructor(voicemailMap) {
        this.contactId = voicemailMap["contactId"];
        this.timestamp = voicemailMap["timestamp"];
        this.agentId = voicemailMap["readerId"];
        this.contactPhoneNumber = voicemailMap["contactPhoneNumber"];
        this.shouldTranscribe = voicemailMap["shouldTranscribe"] || false;
        this.shouldEncrypt = voicemailMap["shouldEncrypt"] || false;
        this.transcribeStatus = voicemailMap["transcribeStatus"];
        this.recordingUrl = voicemailMap["recordingUrl"];
        this.recordingBucketName = voicemailMap["recordingBucketName"];
        this.recordingObjectKey = voicemailMap["recordingObjectKey"];
        this.recordingBucketRegion = voicemailMap["recordingBucketRegion"];
    }

    getTranscriptJobName() {
        return `${this.contactId}_${this.timestamp}`;
    }

}

export {ContactVoicemail};