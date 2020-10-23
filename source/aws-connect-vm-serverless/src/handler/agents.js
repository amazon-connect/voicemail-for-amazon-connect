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

import 'source-map-support/register'
import {ConnectAgentService} from "../service/connect-agent.service";
import {ConnectService} from "../service/connect.service";
import {UsersRepo} from "../repo/users-repo";
import {Responder} from "../lib/responder";

const agentService = new ConnectAgentService(new ConnectService(), new UsersRepo());

exports.getAgentByExtension = async (event, context) => {
    const extensionNumber = event.Details.ContactData.Attributes.extensionNumber;
    const connectAgent = await agentService.getConnectAgentByExtension(extensionNumber);

    try {
        return {
            agentId: connectAgent.userId,
            agentName: connectAgent.connectUser.getFullName(),
            transcribeVoicemail: connectAgent.agent.transcribeVoicemail ? "true" : "false",
            encryptVoicemail: connectAgent.agent.encryptVoicemail ? "true" : "false",
            saveCallRecording: "true",
            transferMessage: `Please wait while we transfer you to ${connectAgent.connectUser.getFullName()}`
        };
    } catch (err) {
        console.log("Error getting the agent by extension. Error: ", JSON.stringify(err, null, 2));
    }

};

exports.getAgentByIdInWorkflow = async (event, context) => {
    const agentArn = event.Details.Parameters.agentArn;
    console.log(`Getting agent details for agent ARN:  ${agentArn}`);
    const agentId = agentArn.substring(agentArn.lastIndexOf('/') + 1);
    console.log(`Using agent ID for lookup:  ${agentId}`);
    const connectAgent = await agentService.getConnectAgentByUserId(agentId);

    try {
        return {
            extension: connectAgent.agent.extension,
            agentName: connectAgent.connectUser.getFullName(),
            transcribeVoicemail: connectAgent.agent.transcribeVoicemail ? "true" : "false",
            encryptVoicemail: connectAgent.agent.encryptVoicemail ? "true" : "false",
            saveCallRecording: "true",
            transferMessage: `Please wait while we transfer you to ${connectAgent.connectUser.getFullName()}`
        };
    } catch (err) {
        console.log("Error getting the agent by ID for workflow. Error: ", JSON.stringify(err, null, 2));
    }

};

exports.getAgents = async (event, context) => {
    const query = event.queryStringParameters || {};
    return agentService.getConnectAgents(query.next, query.size)
        .then(agents => {
            return Responder.Response(200, agents, true);
        })
        .catch(err => Responder.Error(400, err, "Unable to retrieve agent list", true));
};

exports.getAgentById = async (event, context) => {
    let {agentId} = event.pathParameters;
    return agentService.getConnectAgentByUserId(agentId)
        .then(agent => Responder.Response(200, agent, true))
        .catch(err => Responder.Error(400, err, "Unable get agent", true));
};

exports.updateAgentById = async (event, context) => {
    let {agentId} = event.pathParameters;
    let body = JSON.parse(event.body);
    return agentService.updateAgentById(agentId, body)
        .then(agent => Responder.Response(200, {agent}, true))
        .catch(err => Responder.Error(400, err, "Unable update agent", true));
};