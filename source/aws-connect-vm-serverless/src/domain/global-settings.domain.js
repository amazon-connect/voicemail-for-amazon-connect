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

class GlobalSettings {

    constructor(globalSettingsMap) {
        this.transcribeVoicemail = globalSettingsMap["transcribeVoicemail"] || false;
        this.encryptVoicemail = globalSettingsMap["encryptVoicemail"] || false;
        this.deliveryEmail = globalSettingsMap["deliveryEmail"] || null;
        this.availableSMSCountries = globalSettingsMap["availableSMSCountries"] || (process.env.AVAILABLE_SMS_COUNTRIES || "").split(",");
    }

}

export {GlobalSettings};