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

import {AgentsActionKey, AgentsSortKey, AgentsSortOrder} from "../actions/agents.actions";
import {Reducer} from "redux";
import AgentDto from "../../dto/agent.dto";

/**
 * @property {boolean} loading
 * @property {AgentDto[]} agentList
 */
const initialState = {
    loading: false,
    agentList: [],
    sortKey: AgentsSortKey.FIRST_NAME,
    sortOrder: AgentsSortOrder.ASC,
    filter: "",
    agents: [],
    showAgentSettings: false,
    agent: null,
    updateInProgress: false,
    updateError: null,
    page: {
        next: [],
        prev: [],
        current: null
    }
};

const reducer: Reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case AgentsActionKey.GET_AGENTS: {
            let agents = sortAgents(action.value.data, state.sortKey, state.sortOrder);
            let page = {
                next: [...state.page.next],
                current: action.value.current,
                prev: [...state.page.prev]
            };

            // shift the pagination by 1 to next/prev.
            if (page.next.length && page.next[0] === action.value.current) {
                // user moved forward one
                page.next.shift();
                page.prev.push(state.page.current)
            } else if (state.page.prev.length && state.page.prev[state.page.prev.length - 1] === action.value.current) {
                page.next.unshift(state.page.current);
                page.prev.pop();
            }

            if (action.value.next && !page.next.length) {
                page.next.push(action.value.next);
            }

            return {
                ...state,
                agentList: agents,
                agents,
                page
            };
        }
        case AgentsActionKey.SORT_AGENTS: {
            return {
                ...state,
                sortKey: action.value.sortKey,
                sortOrder: action.value.sortOrder,
                agents: sortAgents([...state.agentList], action.value.sortKey, action.value.sortOrder, state.filter),
            };
        }
        case AgentsActionKey.FILTER_AGENTS:
            return {
                ...state,
                filter: action.value,
                agents: sortAgents([...state.agentList], state.sortKey, state.sortOrder, action.value),
            };
        case AgentsActionKey.AGENTS_LOADING:
            return {
                ...state,
                loading: action.value
            };
        case AgentsActionKey.SHOW_AGENT:
            return {
                ...state,
                agent: action.value.agent || Object.assign({}, state.agent),
                showAgentSettings: action.value.showAgentSettings
            };
        case AgentsActionKey.UPDATE_AGENT:
            let agents = [...state.agents];
            let index = agents.findIndex(agent => agent.userId === action.value.agent.userId);
            if (index !== undefined) {
                agents[index] = action.value.agent;
            }
            return {
                ...state,
                agentList: agents,
                agents: sortAgents(agents, state.sortKey, state.sortOrder, state.filter)
            };
        case AgentsActionKey.UPDATE_IN_PROGRESS:
            return {
                ...state,
                updateInProgress: action.value
            };
        case AgentsActionKey.UPDATE_AGENT_ERROR:
            let errorMessage = null;
            if (action.value) {
                errorMessage = action.value.error._error.message;
            }
            return {
                ...state,
                updateError: errorMessage
            };
        default:
            return state;
    }
};

function sortAgents(agents: AgentDto[], sortKey: string, sortOrder: string, filter: string = "") {
    return agents
        .filter(agent => {
            return ((agent.firstName || "").toLowerCase().includes(filter.toLowerCase()) ||
                (agent.lastName || "").toLowerCase().includes(filter.toLowerCase()) ||
                (agent.username || "").toLowerCase().includes(filter.toLowerCase()) ||
                (agent.email || "").toLowerCase().includes(filter.toLowerCase()) ||
                (agent.extension || "").includes(filter.toLowerCase()))
        }).sort((a, b) => {
            switch (sortKey) {
                case AgentsSortKey.FIRST_NAME:
                    return (sortOrder === AgentsSortOrder.ASC) ?
                        (a.firstName > b.firstName ? 1 : -1) :
                        (a.firstName < b.firstName ? 1 : -1);
                case AgentsSortKey.LAST_NAME:
                    return (sortOrder === AgentsSortOrder.ASC) ?
                        (a.lastName > b.lastName ? 1 : -1) :
                        (a.lastName < b.lastName ? 1 : -1);
                case AgentsSortKey.EMAIL:
                    return (sortOrder === AgentsSortOrder.ASC) ?
                        (a.email > b.email ? 1 : -1) :
                        (a.email < b.email ? 1 : -1);
                case AgentsSortKey.EXTENSION:
                    return (sortOrder === AgentsSortOrder.ASC) ?
                        (a.extension > b.extension ? 1 : -1) :
                        (a.extension < b.extension ? 1 : -1);
                default:
                    return (sortOrder === AgentsSortOrder.ASC) ?
                        (a.firstName > b.firstName ? 1 : -1) :
                        (a.firstName < b.firstName ? 1 : -1);
            }
        })
}

export default reducer;