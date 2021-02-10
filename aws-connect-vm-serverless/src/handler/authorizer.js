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

import {AuthService} from "../service/auth.service";

exports.handler = (event, context, callback) => {
    let authService = new AuthService(process.env.COGNITO_USER_POOL_ID);
    console.log(event.authorizationToken, event.methodArn);
    authService.validateAndGeneratePolicy(event.authorizationToken, event.methodArn)
        .then(policy => {
            console.log(policy);
            callback(null, policy);
        })
        .catch(err => {
            console.log("Error", err);
            callback(`Unauthorized ${err}`);
        });
};