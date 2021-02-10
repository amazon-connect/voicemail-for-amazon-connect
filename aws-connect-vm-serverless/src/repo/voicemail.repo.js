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

class ContactVoicemailRepo {

    constructor() {
        this.dynamo = new DynamoDBService(process.env.CONTACT_VOICEMAIL_TABLE_NAME);
    }

    updateTranscriptionStatus(contactId, timestamp, status) {
        // Query for all objects with the contact id
        // Update each object with the new status
        
        let queryParam = {
            KeyConditionExpression: 'contactId = :contactId',
            ExpressionAttributeValues: {
                ':contactId': contactId
            }
        };

        return Promise.all([this.dynamo.query(queryParam)])
            .then(values => {

                let promises = [];
                values[0].map(queryResult => {
                    let params = {
                        Key: {
                            "contactId": contactId,
                            "readerId": queryResult.readerId
                        },
                        ExpressionAttributeValues: {
                            ":status": status
                        },
                        UpdateExpression: "SET transcribeStatus = :status"
                    };
                    promises.push(this.dynamo.update(params));
                });

                return Promise.all(promises);
            });
    }

}

export {ContactVoicemailRepo};
