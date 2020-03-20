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

class S3Service {

    constructor() {
        this.s3 = new AWS.S3();
    }

    getFile(bucket, key) {
        let params = {
            Bucket: bucket,
            Key: key
        };
        return this.s3.getObject(params).promise();
    }

    getPreSignedUrl(bucket, key, expires=900) {
        return new Promise((resolve, reject) => {
            let params = {
                Bucket: bucket,
                Key: key,
                Expires: expires
            };
            return this.s3.getSignedUrl('getObject', params, (err, url) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({
                    url,
                    expires
                });
            });
        });
    }
}

export {S3Service};