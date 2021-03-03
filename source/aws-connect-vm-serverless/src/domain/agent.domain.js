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

class Agent {

    constructor(agentMap) {
        this.userId = agentMap["userId"];
        this.extension = agentMap["extension"];
        this.username = agentMap["username"];
        this.email = agentMap["email"];
        this.transcribeVoicemail = agentMap["transcribeVoicemail"] || false;
        this.encryptVoicemail = agentMap["encryptVoicemail"] || false;
        this.deliveryOptions = agentMap["deliveryOptions"] || {
            sms: {
                enabled: false,
                phoneNumber: null
            },
            email: false
        };
    }

    static create(userId, extension = null, email = null) {
        return new Agent({
            userId, extension: extension, email: email, deliveryOptions: {
                sms: {
                    enabled: false,
                    phoneNumber: null
                },
                email: false
            }
        });
    }

}

export {Agent};