import {CloudFormationResponse, sendCloudFormationResponse} from "../lib/custom-resource-util";
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

import {CognitoService} from "../service/cognito.service";
import {GlobalRepo} from "../repo/global-repo";
import {GlobalSettingsService} from "../service/global-settings.services";

const globalSettings = new GlobalSettingsService(new GlobalRepo());
const cognitoService = new CognitoService();

exports.usersConfig = (event, context) => {
    let {ResourceProperties, RequestType} = event;
    let {AdminEmail, AdminFirstName, AdminLastName,
        ManagerEmail, ManagerFirstName, ManagerLastName
    } = ResourceProperties;

    if ((RequestType === 'Create' || RequestType === 'Update') && AdminEmail !== undefined && ManagerEmail !== undefined) {
        return cognitoService
            .adminCreateUser(AdminEmail, AdminFirstName, AdminLastName, 'Admin,Manager', true)
            .then(() => cognitoService.adminCreateUser(ManagerEmail, ManagerFirstName, ManagerLastName, 'Manager', true))
            .then(() => sendCloudFormationResponse(event, context, CloudFormationResponse.SUCCESS, context.logStreamName))
            .then(result => console.log("Successful send."))
            .then(() => globalSettings.createDefault())
            .then(result => console.log("Successful put!"))
            .catch(err => {
                console.log(JSON.stringify(err, null, 2))
                return sendCloudFormationResponse(event, context, CloudFormationResponse.FAILED, context.logStreamName);
            });
    } else {
        return sendCloudFormationResponse(event, context, CloudFormationResponse.SUCCESS, context.logStreamName)
            .then(result => console.log("Success sending cloudformation result"))
            .catch(err => console.log("Error sending cloudformation result"));
    }
};