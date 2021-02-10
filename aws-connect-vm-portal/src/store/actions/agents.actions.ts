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

import AgentsService from "../../service/agents.service";
import { ApiService } from "../../service/api.service";
import { Dispatch } from "redux";
import AgentDto from "../../dto/agent.dto";
import { PaginationDto } from "../../dto/pagination.dto";

const agentsService = new AgentsService(new ApiService());

const AgentsActionKey = {
  AGENTS_LOADING: "LOADING",
  GET_AGENTS: "GET_AGENTS",
  SORT_AGENTS: "SORT_AGENTS",
  FILTER_AGENTS: "FILTER_AGENTS",
  SHOW_AGENT: "SHOW_AGENT",
  UPDATE_IN_PROGRESS: "UPDATE_IN_PROGRESS",
  UPDATE_AGENT: "UPDATE_AGENT",
  UPDATE_AGENT_ERROR: "UPDATE_AGENT_ERROR"
};

const AgentsSortKey = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  EMAIL: "email",
  PHONE_TYPE: "phoneType",
  EXTENSION: "extension"
};

const AgentsSortOrder = {
  ASC: "asc",
  DESC: "desc"
};

const loadingResults = (loading: boolean) => {
  return {
    type: AgentsActionKey.AGENTS_LOADING,
    value: loading
  }
};

const getAgentsResults = (agents: PaginationDto<AgentDto>) => {
  return {
    type: AgentsActionKey.GET_AGENTS,
    value: agents
  }
};

const sortAgentsResults = (sortKey: string, sortOrder: string) => {
  return {
    type: AgentsActionKey.SORT_AGENTS,
    value: {
      sortKey,
      sortOrder
    }
  }
};

const filterAgentsResults = (filter: string) => {
  return {
    type: AgentsActionKey.FILTER_AGENTS,
    value: filter
  }
};

const showAgentResults = (showAgentSettings: boolean, agent: AgentDto | null = null) => {
  return {
    type: AgentsActionKey.SHOW_AGENT,
    value: { showAgentSettings, agent }
  }
};

const updatingInProgressResults = (updating: boolean) => {
  return {
    type: AgentsActionKey.UPDATE_IN_PROGRESS,
    value: updating
  };
};

const updateAgentResults = (agent: AgentDto) => {
  return {
    type: AgentsActionKey.UPDATE_AGENT,
    value: { agent }
  }
};

const updateAgentErrorResults = (error: Error | null) => {
  return {
    type: AgentsActionKey.UPDATE_AGENT_ERROR,
    value: error
  }
};

const _getAgents = async (dispatch: Dispatch, next: string | null) => {
  dispatch(loadingResults(true));
  try {
    let agents = await agentsService.getAgents(next);
    dispatch(getAgentsResults(agents));
  } catch (err) {
    // console.log(err);
  } finally {
    dispatch(loadingResults(false));
  }
};

const _syncAgent = async (dispatch: Dispatch) => {
  await agentsService.syncAgent();
  return _getAgents(dispatch, null);
};

const AgentsAction = {
  syncAgents: () => async (dispatch: Dispatch) => _syncAgent(dispatch),
  getAgents: (next: string | null) => (dispatch: Dispatch) => _getAgents(dispatch, next),
  updateAgent: (
    agentId: string,
    extensionNumber: string,
    deliverSMSPhoneNumber: string,
    deliverSMS: boolean,
    deliverEmail: boolean,
    encryptVoicemail: boolean,
    transcribeVoicemail: boolean
  ) => {
    return (dispatch: Dispatch) => {
      dispatch(updatingInProgressResults(true));
      dispatch(updateAgentErrorResults(null));
      agentsService.updateAgent(agentId,
        extensionNumber, deliverSMSPhoneNumber, deliverSMS,
        deliverEmail, encryptVoicemail, transcribeVoicemail)
        .then(agent => {
          // console.log("Agent Updated"!, agent);
          dispatch(updateAgentResults(agent));
          dispatch(showAgentResults(false));
        })
        .catch(err => {
          dispatch(updateAgentErrorResults(err))
        })
        .finally(() => {
          dispatch(updatingInProgressResults(false));
        })
    }
  },
  sortAgents: (sortKey: string, sortOrder: string) =>
    (dispatch: Dispatch) =>
      dispatch(sortAgentsResults(sortKey, sortOrder)),
  filterAgents: (filter: string) =>
    (dispatch: Dispatch) =>
      dispatch(filterAgentsResults(filter)),
  showAgent: (show: boolean, agent: AgentDto | null) => async (dispatch: Dispatch) => {
    // console.log(agent);

    if (agent == null) {
      dispatch(showAgentResults(show, agent));
      dispatch(updateAgentErrorResults(null));
    } else {
      try {
        let result = await agentsService.getAgent(agent.userId);
        dispatch(showAgentResults(show, result));
        dispatch(updateAgentErrorResults(null))
      } catch (err) {
        // console.log(err);
      }
    }
  }
};

export { AgentsAction, AgentsActionKey, AgentsSortKey, AgentsSortOrder }
