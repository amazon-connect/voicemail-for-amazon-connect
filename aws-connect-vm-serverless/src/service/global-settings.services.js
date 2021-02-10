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

class GlobalSettingsService {

    constructor(globalRepo) {
        this.globalRepo = globalRepo;
    }

    getSettings() {
        return this.globalRepo.getGlobalSettings();
    }

    update(transcribe, encrypt, deliveryEmail, availableSMSCountries) {
        return this.globalRepo.updateGlobalSettings(transcribe, encrypt, deliveryEmail, availableSMSCountries)
            .then(result => {
                console.log("Result: " + JSON.stringify(result));
                let {transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries} = result.Attributes;
                return {
                    transcribeVoicemail,
                    encryptVoicemail,
                    deliveryEmail,
                    availableSMSCountries
                };
            });
    }

    createDefault() {
        return this.globalRepo.createGlobalSettings(true, true, process.env.DELIVERY_EMAIL);
    }

}

export {GlobalSettingsService};