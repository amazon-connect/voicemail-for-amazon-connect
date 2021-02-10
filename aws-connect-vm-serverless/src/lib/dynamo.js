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

const AWS = require("aws-sdk");

class DynamoDBService {

    constructor(tableName) {
        this.tableName = tableName;
        this.client = new AWS.DynamoDB.DocumentClient();
    }

    /**
     * @param params
     * @returns {Promise<Object>}
     */
    update(params) {
        params["TableName"] = this.tableName;
        params["ReturnValues"] = "ALL_NEW";
        return this.client.update(params).promise();
    }

    put(params) {
        params["TableName"] = this.tableName;
        return this.client.put(params).promise();
    }

    /**
     * @param params
     * @returns {Promise<DocumentClient.AttributeMap[] | null>}
     */
    query(params) {
        params["TableName"] = this.tableName;
        return this.client.query(params).promise().then(result => result.Items || null);
    }

    scan(params, items = []) {
        params["TableName"] = this.tableName;
        return this.client.scan(params).promise().then(result => {
            let allItems = items;

            if (result.Items) {
                allItems = items.concat(result.Items);
            }

            if (result.LastEvaluatedKey){
                console.log("Rescanning with next page");
                params.ExclusiveStartKey = result.LastEvaluatedKey;
                return this.scan(params, allItems);
            } else {
                return allItems;
            }
        });
    }

    queryWithNext(params) {
      params["TableName"] = this.tableName;
      return this.client.query(params).promise().then(result => {
        let data = {
          data: result.Items || []
        };
        if(result.LastEvaluatedKey) {
          data.next = Buffer.from(JSON.stringify(result.LastEvaluatedKey), 'utf8').toString('base64');
        }
        return data;
      });
    }

    scanWithNext(params) {
        params["TableName"] = this.tableName;
        return this.client.scan(params).promise().then(result => {
            let data = {
                data: result.Items || []
            };
            if(result.LastEvaluatedKey) {
                data.next = Buffer.from(JSON.stringify(result.LastEvaluatedKey), 'utf8').toString('base64');
            }
            return data;
        });
    }

    /**
     * @param params
     * @param callback
     * @returns {Promise<DocumentClient.AttributeMap | null>}
     */
    getItem(params, callback) {
        params["TableName"] = this.tableName;
        return this.client.get(params).promise().then(result => result.Item || null);
    }

    batchWrite(batch, startingIndex) {
        return new Promise((resolve, reject) => {
            this._batchWrite(batch, startingIndex).then(result => {
                if (batch.length > result.index) {
                    this.batchWrite(batch, result.index).then(nextData => {
                        resolve(nextData);
                    });
                } else {
                    resolve(result.data);
                }
            });
        });
    }

    _batchWrite(batch, startingIndex) {
        return new Promise((resolve, reject) => {
            // DDB has a limit of 25 items at once
            let maxDdbUpdate = 24;
            let endIndex = (batch.length > startingIndex + maxDdbUpdate) ? startingIndex + maxDdbUpdate : batch.length;
            let batchToUpdate = batch.slice(startingIndex, endIndex);

            let batchParam = {
                RequestItems: {
                    [this.tableName]: batchToUpdate
                }
            };
            this.client.batchWrite(batchParam, (err, data) => {
                if (err) {
                    console.log("Any error? " + JSON.stringify(err, null, 2));
                }
                resolve({'index': startingIndex + maxDdbUpdate, 'data': data});
            });
        });
    }
}

export {DynamoDBService};