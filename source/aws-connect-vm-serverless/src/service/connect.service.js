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

import {ConnectUser} from "../domain/connect-user.domain";

const AWS = require('aws-sdk');
const delay = t => new Promise(resolve => setTimeout(resolve, t));

class ConnectService {

    constructor() {
        this.instanceId = process.env.AMAZON_CONNECT_INSTANCE_ARN.split('/')[1];
        this.connect = new AWS.Connect();

        // max backoff time set to 45 sec
        this.maxBackOffTime = 45;
    }


    /**
     * @returns {Promise<ConnectUser[]>}
     */
    getConnectUsers() {
        return this.listConnectUsers()
            .then(users => {
                let promises = users.map(user => this.getConnectUser(user.Id));
                return Promise.all(promises);
            });
    }

    /**
     *
     * @param userId
     * @returns {Promise<ConnectUser>}
     */
    getConnectUser(userId) {
        return new Promise((resolve, reject) => {
            let params = {
                InstanceId: this.instanceId,
                UserId: userId
            };
            this.connect.describeUser(params, (err, data) => {
                if (err) {
                    console.log("Error", err);
                    reject(err);
                    return;
                }
                if (!data) {
                    console.log("No user found");
                    reject(err);
                    return;
                }
                resolve(new ConnectUser(data.User));
            });
        });
    }

    listConnectUsers() {
        return this._listConnectUsers([], null, 0);
    }


    _listConnectUsers(list, nextToken, retry) {
        let params = {
            InstanceId: this.instanceId,
            MaxResults: 1000
        };
        if (nextToken) {
            params["NextToken"] = nextToken;
        }

        return this.connect.listUsers(params)
            .promise()
            .then(data => {
                let {UserSummaryList, NextToken} = data;
                let users = list.concat(UserSummaryList);
                if (NextToken) {
                    return this._listConnectUsers(users, NextToken, 0);
                } else {
                    return users;
                }
            })
            .catch(err => {
                console.warn("list connect user failed. Retry: " + retry, err);
                if (retry > 5) {
                    throw err;
                }

                return delay(Math.min(Math.pow(retry, 2), this.maxBackOffTime))
                    .then(() => {
                        return this._listConnectUsers(list, nextToken, retry + 1);
                    })
            });
    }

}

export {ConnectService};