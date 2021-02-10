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

import {DynamoDBService} from "../lib/dynamo";
import {Agent} from "../domain/agent.domain";

class UsersRepo {

    constructor() {
        this.dynamo = new DynamoDBService(process.env.USERS_TABLE_NAME);
        this.amazonConnectInstanceId = process.env.AMAZON_CONNECT_INSTANCE_ARN;
    }

    /**
     * @param extension
     * @returns {Promise<object>}
     */
    getAgentByExtension(extension) {
        let params = {
            IndexName: "AgentExtensionIndex",
            KeyConditionExpression: "extension = :ext",
            ExpressionAttributeValues: {
                ":ext": extension
            },
        };
        return this.dynamo.query(params)
            .then(items => {
                return items.length > 0 ? new Agent(items[0]) : null;
            });
    }

    getAgentByUserId(userId) {
        let params = {
            Key: {
                agentId: userId
            }
        };
        return this.dynamo.getItem(params).then(item => {
            return item ? new Agent(item) : null;
        });
    }

    getAgents(next, size) {
        let param = {
            Limit: size || 1000,
            Select: "ALL_ATTRIBUTES"
        };

        if (next) {
            param.ExclusiveStartKey = JSON.parse(Buffer.from(next, 'base64').toString('utf-8'));
        }

        return this.dynamo
            .scanWithNext(param);
    }

    getAllAgents() {
        return this.dynamo
            .scan({
                Select: "ALL_ATTRIBUTES"
            });
    }

    createAgentCreateParam(agent) {
        let data = {
            Item: {
                ...agent,
                agentId: agent.userId
            }
        };
        if (agent.extension === "") {
            delete data.Item.extension;
        }

        return data;
    }

    createAgentDeleteParam(agent) {
        return {
            Key: {
                agentId: agent.userId
            }
        };
    }

    createAgent(agent) {
        let params = this.createAgentData(agent)
        return this.dynamo.put(params);
    }

    updateAgentById(agentId, {extension, deliverSMSPhoneNumber, deliverSMS, deliverEmail, encryptVoicemail, transcribeVoicemail}) {
        let expressionAttrValues = {
            ":tv": transcribeVoicemail || false,
            ":ev": encryptVoicemail || false,
            ":de": deliverEmail,
            ":do": {
                email: deliverEmail,
                sms: {
                    enabled: deliverSMS,
                    phoneNumber: deliverSMSPhoneNumber === "" ? "null" : deliverSMSPhoneNumber
                }

            }
        };

        if (extension !== null && extension !== "") {
            expressionAttrValues[":ext"] = extension;
        }
        let updateExpression = "SET transcribeVoicemail=:tv, encryptVoicemail = :ev, deliveryEmail = :de, deliveryOptions = :do";
        (extension === null || extension === "") ? updateExpression += ` REMOVE extension` : updateExpression += `, extension = :ext`;

        let params = {
            Key: {
                agentId: agentId
            },
            ExpressionAttributeValues: expressionAttrValues,
            UpdateExpression: updateExpression
        };
        return this.dynamo.update(params);
    }

    batchWrite(values) {
        return this.dynamo.batchWrite(values, 0);
    }
}

export {UsersRepo};