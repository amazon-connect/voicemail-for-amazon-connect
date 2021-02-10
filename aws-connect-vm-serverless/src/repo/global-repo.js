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
import {GlobalSettings} from "../domain/global-settings.domain";

class GlobalRepo {

    constructor() {
        this.dynamo = new DynamoDBService(process.env.GLOBAL_TABLE_NAME);
        this.amazonConnectInstanceArn = process.env.AMAZON_CONNECT_INSTANCE_ARN;
    }

    getGlobalSettings() {
        console.log("Getting Global Settings");
        let params = {
            Key: {
                instanceArn: this.amazonConnectInstanceArn
            }
        };
        return this.dynamo.getItem(params).then(item => {
            return item ? new GlobalSettings(item) : null;
        });
    }

    createGlobalSettings(transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries) {
        let settings = new GlobalSettings({transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries});
        settings.instanceArn = this.amazonConnectInstanceArn;
        let params = {
            Item: settings
        };
        console.log("dynamo put");
        return this.dynamo.put(params).then(() => settings);
    }

    updateGlobalSettings(transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries) {
        return this.getGlobalSettings().then(settings => {
            if (settings) {
                return this._updateGlobalSettings(transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries);
            } else {
                console.log("in create");
                return this.createGlobalSettings(transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries);
            }
        });
    }

    _updateGlobalSettings(transcribeVoicemail, encryptVoicemail, deliveryEmail, availableSMSCountries) {
        let params = {
            Key: {
                instanceArn: this.amazonConnectInstanceArn
            },
            ExpressionAttributeValues: {
                ":tv": transcribeVoicemail,
                ":ev": encryptVoicemail,
                ":de": deliveryEmail,
                ":ac": availableSMSCountries
            },
            UpdateExpression: "SET transcribeVoicemail=:tv, encryptVoicemail=:ev, deliveryEmail=:de, availableSMSCountries=:ac"
        };
        return this.dynamo.update(params);
    }
}

export {GlobalRepo};