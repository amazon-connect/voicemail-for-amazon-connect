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
        this.secretsManager = new AWS.SecretsManager();

        const getAWSCredentials = async() => {
            const results = await this.secretsManager.getSecretValue({SecretId: process.env.SECRET_ARN}).promise()
            .then((res) => {
                return res;
            })
            .catch((err) => {
                console.log('error ', err);
                return err;
            });
            return results;
        };
        
        (async () => {
            const data = await getAWSCredentials()
            this.isTempToken = false;
            if ('SecretString' in data) {
                var secret = data.SecretString;
                var jsonParsed = JSON.parse(secret);
                var accessKeyId = jsonParsed.accessKeyId;
                var secretAccessKey = jsonParsed.secretAccessKey;
                // Creating a S3 client to include the access key ID and secret access key of an IAM user and to use AWS Signature Version 4
                this.s3 = new AWS.S3({
                    signatureVersion: 'v4',
                    credentials: {
                        secretAccessKey: secretAccessKey,
                        accessKeyId: accessKeyId
                    }
                });
            } else {
                this.isTempToken = true;
                // Creating a S3 client using temporary credentials of Lambda IAM Role
                this.s3 = new AWS.S3();
            }
        })()
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
            const TWELVE_HOURS = 43200; // 12 hours in seconds
            if (!this.isTempToken) {
                console.log('Creating a pre-signed URL valid up to ' + expires + ' seconds using IAM User Access Key.');
            } else {
                if (expires > TWELVE_HOURS) {
                    console.log('Could not create a presigned URL valid for greater than 12 hours because there was an error while retrieving the IAM User Access Key credentials from the AWS Secrets Manager (please refer to CloudWatch Logs for details). So creating a presigned URL valid up to 12 hours using temporary credentials of Lambda IAM Role.');
                    expires = TWELVE_HOURS;
                } 
            }
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