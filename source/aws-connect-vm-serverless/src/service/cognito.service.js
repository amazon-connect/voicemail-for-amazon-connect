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

const AWS = require('aws-sdk');

global.fetch = require('node-fetch').default;

import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    CognitoAccessToken,
    CognitoIdToken,
    CognitoRefreshToken,
    CognitoUserSession,
    AuthenticationDetails
} from 'amazon-cognito-identity-js';

import {NewPasswordRequiredError} from "../errors/cognito.errors";

export class CognitoService {

    constructor() {
        this.identityServiceProvider = new AWS.CognitoIdentityServiceProvider();
        this.userPoolId = process.env.COGNITO_USER_POOL_ID;
    }

    /**
     *
     * @param email
     * @param firstName
     * @param lastName
     * @param {string|null} temporaryPassword If null, then a temporary password will be provided by Cognito
     * @param roles
     * @param {boolean} removeExisting To remove the existing user before creating a new user
     * @returns {Promise<Object>}
     */
    adminCreateUser(email, firstName, lastName, roles, removeExisting=false, temporaryPassword=null) {
        let params = {
            UserPoolId: this.userPoolId,
            Username: email,
            DesiredDeliveryMediums: ["EMAIL"],
            ForceAliasCreation: false,
            UserAttributes: [
                { Name: 'given_name', Value: firstName },
                { Name: 'family_name', Value: lastName},
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: "true" },
            ]
        };

        if (temporaryPassword) {
            params["TemporaryPassword"] = temporaryPassword;
        }

        return this.getCognitoUser(email)
            .then(result => {
                let actions;
                if (result && removeExisting) {
                    actions = this.adminDeleteUser(email)
                      .then(() => this.identityServiceProvider.adminCreateUser(params).promise());
                } else {
                    actions = this.identityServiceProvider.adminCreateUser(params).promise()
                }

                return actions
                  .then(() => Promise.all(
                    roles.split(",").map(role => this.identityServiceProvider.adminAddUserToGroup({
                        GroupName: role,
                        UserPoolId: this.userPoolId,
                        Username: email
                    }).promise())));
            });
    }

    adminDeleteUser(email) {
        let params = {
            UserPoolId: this.userPoolId,
            Username: email
        };
        return this.identityServiceProvider.adminDeleteUser(params).promise();
    }

    refreshToken(email, idToken, accessToken, refreshToken) {
        return new Promise((resolve, reject) => {
            const AccessToken = new CognitoAccessToken({AccessToken: accessToken});
            const IdToken = new CognitoIdToken({IdToken: idToken});
            const RefreshToken = new CognitoRefreshToken({RefreshToken: refreshToken});
            const cachedSession = new CognitoUserSession({IdToken, RefreshToken, AccessToken});
            console.log("Refreshing token", cachedSession.isValid());
            if (!cachedSession.isValid()) {
                reject(new Error("InvalidUserSession"));
            } else {
                let cognitoUser = new CognitoUser({Username: email, Pool: new CognitoUserPool(this.poolData)});
                cognitoUser.refreshSession(RefreshToken, (err, session) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({
                        idToken: session.getIdToken().getJwtToken(),
                        accessToken: session.getAccessToken().getJwtToken(),
                        refreshToken: session.getRefreshToken().getToken()
                    });
                });
            }
        });
    }

    getCognitoUser(username) {
        return new Promise((resolve, reject) => {
            let params = {
                UserPoolId: this.userPoolId,
                Username: username
            };
            this.identityServiceProvider.adminGetUser(params, (err, data) => {
                if (err) {
                    console.log(JSON.stringify(err, null, 2));
                    resolve(null);
                }
                resolve(data);
            });
        });
    }

}