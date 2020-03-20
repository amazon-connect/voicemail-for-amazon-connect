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

import {AwsResourceUtil} from "../lib/auth/aws-resource-util";
import {AuthPolicy} from "../lib/auth/auth-policy";
import jose from 'node-jose';
import https from 'https';

class AuthService {

    constructor(userPoolId) {
        this.keysUrl = 'https://cognito-idp.' + process.env.APP_REGION + '.amazonaws.com/' + userPoolId + '/.well-known/jwks.json';
    }

    /**
     * @param authorizationToken
     * @param methodArn
     * @returns {Promise<Object>|Promise<{reason: string, effect: string, claims: null}>}
     */
    validateAndGeneratePolicy(authorizationToken, methodArn) {
        if (typeof authorizationToken === 'undefined') {
            console.log("No Token found");
            return Promise.resolve({effect: 'deny', reason: 'No auth token', claims: null});
        } else {
            const split = authorizationToken.split('Bearer');
            if (split.length !== 2) {
                console.log("No token in Bearer");
                return Promise.resolve({effect: 'deny', reason: 'No token in Bearer', claims: null});
            }

            const token = split[1].trim();
            let jwtSplit = token.split(".");
            let header = JSON.parse(jose.util.base64url.decode(jwtSplit[0]));
            let kid = header.kid;

            return this.verifyKey(kid, token, this.keysUrl).then(claims => this.verifyAndGeneratePolicy(claims, methodArn));
        }
    }

    verifyAndGeneratePolicy(claimResults, methodArn) {
        if (!claimResults) {
            throw 'Invalid claim';
        }
        let {claims, effect, reason} = claimResults;
        let username = claims['cognito:username'];
        if (effect) {
            return this._generate(username, effect, methodArn, claims, {
                reason,
                roles: claims['custom:roles']
            });
        } else {
            throw 'Invalid Token';
        }
    }

    verifyKey(kid, token, keysUrl) {
        return new Promise((resolve, reject) => {
            https.get(keysUrl, response => {
                if (response.statusCode === 200) {
                    response.on('data', body => {
                        let keys = JSON.parse(body)['keys'];
                        let keyIndex = -1;
                        for (let i = 0; i < keys.length; i++) {
                            if (kid === keys[i].kid) {
                                keyIndex = i;
                                break;
                            }
                        }
                        if (keyIndex === -1) {
                            console.error("No public key");
                            resolve({effect: 'deny', reason: 'No public key', claims: null});
                            return;
                        }

                        jose.JWK.asKey(keys[keyIndex]).then(result => {
                            jose.JWS.createVerify(result).verify(token).then(result => {
                                let claims = JSON.parse(result.payload);
                                let currentTimestamp = Math.floor(new Date() / 1000);
                                if (currentTimestamp > claims.exp) {
                                    resolve({effect: 'deny', reason: 'Token expired', claims});
                                    return;
                                }

                                resolve({effect: 'allow', reason: 'Verified', claims});
                            }, error => {
                                reject(error);
                            });
                        }, err => {
                            reject(err);
                        });
                    });
                } else {
                    reject(new Error("Key Unverified"));
                }
            });
        });
    }

    _generate(principalId, effect, resource, claims, context = {}) {
        let roles = claims['cognito:groups'];
        let isAdmin = roles.includes('Admin');
        let isManager = roles.includes('Manager');
        let gatewayResource = AwsResourceUtil.parseApiGatewayResource(resource);
        let policy = new AuthPolicy(principalId, gatewayResource.accountId, gatewayResource.apiOptions);

        if (effect.toLowerCase() === "allow") {
            if (isAdmin) {
                policy.allowAllMethods();
            } else if (isManager) {
                // TODO: Allow only manager specific endpoints | policy.allowMethod("POST", "/manager/*");
                policy.allowAllMethods();
            } else {
                policy.denyAllMethods();
            }

            let policyResponse = policy.build();
            if (context) {
                policyResponse.context = {
                    ...context
                };
            }
            return policyResponse;
        } else {
            return this._build(principalId, effect, resource, claims, context);
        }
    }

    _build(principalId, effect, resource, claims, context = {}) {
        let authResponse = {};
        authResponse.principalId = principalId;
        if (effect && resource) {
            let policyDocument = {};
            policyDocument.Version = '2012-10-17';
            policyDocument.Statement = [];
            let statementOne = {};
            statementOne.Action = 'execute-api:Invoke';
            statementOne.Effect = effect.toLowerCase() === "allow" ? "Allow" : "Deny";
            statementOne.Resource = resource;
            policyDocument.Statement[0] = statementOne;
            authResponse.policyDocument = policyDocument;
        }

        // Optional output with custom properties of the String, Number or Boolean type.
        authResponse.context = {
            ...context
        };
        return authResponse;
    }

}

export {AuthService};