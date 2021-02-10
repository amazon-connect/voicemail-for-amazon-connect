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

import {AgentInterface, BasicAgentInterface} from "../interface/agent.interface";

class AgentDto {
    constructor(
        public userId: string,
        public username: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public phoneType: string,
        public phoneNumber: string,
        public extension: string,
        public encryptVoicemail: boolean,
        public transcribeVoicemail: boolean,
        public deliverSMS: boolean,
        public deliverSMSPhoneNumber: boolean,
        public deliverEmail: boolean
    ) {
    }

    static fromAgent(agent: AgentInterface): AgentDto {
        return new this(
            agent.userId,
            agent.connectUser.username,
            agent.connectUser.firstName,
            agent.connectUser.lastName,
            agent.connectUser.email,
            AgentDto.phoneTypeToDisplayString(agent.connectUser.phoneType),
            agent.connectUser.deskPhoneNumber,
            agent.agent.extension,
            agent.agent.encryptVoicemail || false,
            agent.agent.transcribeVoicemail || false,
            agent.agent.deliveryOptions.sms.enabled || false,
            agent.agent.deliveryOptions.sms.phoneNumber,
            agent.agent.deliveryOptions.email || false
        );
    }

    static fromBasicAgent(agent: BasicAgentInterface): AgentDto {
        const sms = (agent.deliveryOptions || {}).sms || {};
        const deliveryOptions = agent.deliveryOptions || {};

        return new this(
            agent.userId,
            agent.username,
            "",
            "",
            "",
            "",
            "",
            agent.extension,
            agent.encryptVoicemail || false,
            agent.transcribeVoicemail || false,
            sms.enabled || false,
            sms.phoneNumber,
            deliveryOptions.email || false
        );

    }

    static phoneTypeToDisplayString(type: string): string {
        switch (type) {
            case "SOFT_PHONE":
                return "Soft Phone";
            case "DESK_PHONE":
                return "Desk Phone";
            default:
                return "";
        }
    }

}

export default AgentDto;