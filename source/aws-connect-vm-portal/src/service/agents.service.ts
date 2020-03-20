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

import {ApiService} from "./api.service";
import AgentDto from "../dto/agent.dto";
import AgentRequestDto from "../dto/agent-request.dto";
import {PaginationDto} from "../dto/pagination.dto";

class AgentsService {

    apiService: ApiService;

    constructor(apiService: ApiService) {
        this.apiService = apiService;
    }

    getAgents(next : string | null): Promise<PaginationDto<AgentDto>> {
        return this.apiService.getAgents(next)
            .then(agents => new PaginationDto<AgentDto>(
                agents.data.map(agent => AgentDto.fromBasicAgent(agent)),
                agents.next,
                next));
    }

    /**
     *
     * @param agentId
     * @param extensionNumber
     * @param deliverSMSPhoneNumber
     * @param deliverSMS
     * @param deliverEmail
     * @param encryptVoicemail
     * @param transcribeVoicemail
     * @returns {Promise<AgentDto>}
     */
    updateAgent(
        agentId: string,
        extensionNumber: string,
        deliverSMSPhoneNumber: string,
        deliverSMS: boolean,
        deliverEmail: boolean,
        encryptVoicemail: boolean,
        transcribeVoicemail: boolean
    ): Promise<AgentDto> {
        let agentRequest = new AgentRequestDto(
            extensionNumber,
            deliverSMSPhoneNumber,
            deliverSMS,
            deliverEmail,
            encryptVoicemail,
            transcribeVoicemail
        );
        return this.apiService.updateAgentSettings(agentId, agentRequest)
            .then(agent => AgentDto.fromAgent(agent))
    }

    getAgent(agentId: string): Promise<AgentDto> {
        return this.apiService.getAgent(agentId)
            .then(agent => AgentDto.fromAgent(agent))
    }

    async syncAgent() {
        return this.apiService.syncAgent();
    }
}

export default AgentsService;