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

import {GlobalSettingsService} from "../service/global-settings.services";
import {GlobalRepo} from "../repo/global-repo";
import {Responder} from "../lib/responder";

const globalSettingsService = new GlobalSettingsService(new GlobalRepo());

exports.update = async (event, context) => {
    let {transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries} = JSON.parse(event.body);
    console.log("Update Global Settings");
    return globalSettingsService.update(transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries)
        .then(result => Responder.Response(200, {settings: result}, true))
        .catch(err => Responder.Error(400, err, "Unable to update global settings", true));
};

exports.get = async (event, context) => {
    console.log("Update Global Settings");
    return globalSettingsService.getSettings()
        .then(result => Responder.Response(200, {settings: result}, true))
        .catch(err => Responder.Error(400, err, "Unable to update global settings", true));
};