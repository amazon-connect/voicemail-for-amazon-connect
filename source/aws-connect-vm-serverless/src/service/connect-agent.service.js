/******************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved. 
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at                                                            
 *                                                                              
 *      http://www.apache.org/licenses/                                        
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.                                              
******************************************************************************/

import {ConnectAgent} from "../domain/connect-agent.domain";
import {
    MissingParameterError,
    InvalidParameterError, MissingParametersError, GenericError
} from "../errors/standard.errors";
import {Agent} from "../domain/agent.domain";
import {
    ExtensionInUseError
} from "../errors/agent.errors";

import PhoneNumber from 'awesome-phonenumber';

class ConnectAgentService {

    constructor(connectService, usersRepo) {
        this.usersRepo = usersRepo;
        this.connectService = connectService;
    }

    /**
     * @param extension
     * @returns {Promise<ConnectAgent>}
     */
    getConnectAgentByExtension(extension) {
        return this.usersRepo.getAgentByExtension(extension)
            .then(agent => this.connectService.getConnectUser(agent.userId)
                .then(connectUser => new ConnectAgent(agent, connectUser)));
    }

    /**
     * @param userId
     * @returns {Promise<ConnectAgent>}
     */
    getConnectAgentByUserId(userId) {
        return this.connectService.getConnectUser(userId)
            .then(user => this.usersRepo.getAgentByUserId(userId)
                .then(agent => new ConnectAgent(agent, user)));
    }

    /**
     * @returns {Promise<ConnectAgent[]>}
     */
    getConnectAgents(next, size) {
        return this.usersRepo.getAgents(next, size);
    }

    syncConnectAgents() {
        // collect all users in the system
        return Promise.all([this.connectService.listConnectUsers(), this.usersRepo.getAllAgents()])
            .then(values => {
                let [connectUsers, dbUsers] = values;
                let needUpdate = [];

                connectUsers.forEach(connectUser => {
                    const found = dbUsers.find(dbUser => dbUser.userId === connectUser.Id);
                    let agent;
                    if (found && found.username !== connectUser.Username) {
                        agent = {
                            ...found,
                            username: connectUser.Username
                        };
                        needUpdate.push({PutRequest:this.usersRepo.createAgentCreateParam(agent)});
                    } else if (!found) {
                        agent = {
                            userId: connectUser.Id,
                            username: connectUser.Username
                        };
                        needUpdate.push({PutRequest: this.usersRepo.createAgentCreateParam(agent)});
                    }
                });

                dbUsers.forEach(dbUser => {
                    const found = connectUsers.find(connectUser => connectUser.Id === dbUser.userId);
                    if (!found) {
                        needUpdate.push({DeleteRequest: this.usersRepo.createAgentDeleteParam(dbUser)});
                    }
                });

                if(needUpdate.length > 0) {
                    return this.usersRepo.batchWrite(needUpdate);
                }
            });
    }

    updateAgentById(agentId, update) {
        return this._validateAgentUpdate(agentId, update)
            .then(() => this.createAgentIfNeeded(agentId, update.extension))
            .then(() => this.usersRepo.updateAgentById(agentId, update))
            .then(() => this.getConnectAgentByUserId(agentId));
    }

    createAgentIfNeeded(agentId, extension) {
        let createAgentPromise = this.usersRepo.getAgentByUserId(agentId).then(agent => {
            if (agent === null) return this.usersRepo.createAgent(Agent.create(agentId, extension));
            return agent;
        });
        if (extension) {
            return this.usersRepo.getAgentByExtension(extension)
                .then(agent => {
                    if (agent != null && agent.userId !== agentId) {
                        throw new ExtensionInUseError(extension);
                    }
                    return agent;
                }).then(() => createAgentPromise);
        } else {
            return createAgentPromise;
        }
    }

    _validateAgentUpdate(agentId, update) {
        return new Promise((resolve, reject) => {
            let {extension, deliverSMSPhoneNumber, deliverSMS, deliverEmail, encryptVoicemail, transcribeVoicemail} = update;
            if (!agentId) {
                reject(new MissingParameterError("agentId"));
                return;
            }

            if (deliverSMS === true && (deliverSMSPhoneNumber === undefined || deliverSMSPhoneNumber === "")) {
                reject(new InvalidParameterError(
                    "Please provide a phone number for SMS delivery",
                    "deliverSMSPhoneNumber cannot be null or empty if deliverSMS is true"));
                return;
            }

            if (deliverSMSPhoneNumber) {
                let phone = new PhoneNumber(deliverSMSPhoneNumber);
                if (!phone.isValid()) {
                    reject(new GenericError(
                        "InvalidPhoneNumberError",
                        "The phone number you've entered is invalid.  Please enter a valid phone number and try again.",
                        `Phone number cannot be validated for ${deliverSMSPhoneNumber}`
                    ));
                } else {
                    update["deliverSMSPhoneNumber"] = phone.getNumber();
                }
            }

            if (update.hasOwnProperty("extension") &&
                (update["extension"].length > 5 || Number.isNaN(update["extension"]))) {
                reject(new InvalidParameterError("Invalid extension number", "Extension number must be numeric and less than 5 digits."));
                return;
            }

            if (!update.hasOwnProperty("extension") ||
                !update.hasOwnProperty("deliverSMS") ||
                !update.hasOwnProperty("deliverEmail") ||
                !update.hasOwnProperty("transcribeVoicemail") ||
                !update.hasOwnProperty("encryptVoicemail")
            ) {
                reject(new MissingParametersError());
                return;
            }

            resolve({
                agentId,
                update
            });
        });
    }

}

export {ConnectAgentService};