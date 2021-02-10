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

class AgentRequestDto {

    extension: string | null;
    deliverSMSPhoneNumber: string | null;
    deliverSMS: boolean;
    deliverEmail: boolean;
    encryptVoicemail: boolean;
    transcribeVoicemail: boolean;

    constructor(
        extensionNumber: string,
        deliverSMSPhoneNumber: string,
        deliverSMS: boolean,
        deliverEmail: boolean,
        encryptVoicemail: boolean,
        transcribeVoicemail: boolean
    ) {
        this.extension = extensionNumber || "";
        this.deliverSMSPhoneNumber = deliverSMSPhoneNumber || "";
        this.deliverSMS = deliverSMS || false;
        this.deliverEmail = deliverEmail || false;
        this.encryptVoicemail = encryptVoicemail || false;
        this.transcribeVoicemail = transcribeVoicemail || false;
    }

}

export default AgentRequestDto;