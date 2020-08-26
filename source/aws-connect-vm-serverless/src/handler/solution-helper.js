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
'use strict';

console.log('Loading function');

const https = require('https');
const url = require('url');
const UUID = require('uuid');
let AWS = require('aws-sdk');
let s3 = new AWS.S3();
const fs = require('fs');
let agw = new AWS.APIGateway();

const _downloadLocation = '/tmp/web-site-manifest.json';

/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    let responseStatus = 'FAILED';
    let responseData = {};
    console.log("Request type: " + event.RequestType);

    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'createUuid') {
            responseStatus = 'SUCCESS';
            responseData = {
                UUID: UUID.v4()
            };
            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);

        } else if (event.ResourceProperties.customAction === 'copyWebAssets') {
            copyWebAssets(event.ResourceProperties,
                          function(err, data) {
                            if (err) {
                                responseData = {
                                    Error: 'Copy of website assets failed'
                                };
                                console.log([responseData.Error, ':\n', err].join(''));
                            } else {
                                responseStatus = 'SUCCESS';
                                responseData = {};
                            }
        
                            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                        });
        }
    } else if (event.RequestType === 'Delete') {
        responseStatus = 'SUCCESS';
        sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
    } else if (event.ResourceProperties.customAction === 'copyWebAssets') {
        copyWebAssets(event.ResourceProperties,
            function(err, data) {
            if (err) {
                responseData = {
                    Error: 'Copy of website assets failed'
                };
                console.log([responseData.Error, ':\n', err].join(''));
            } else {
                responseStatus = 'SUCCESS';
                responseData = {};
            }

            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
        });
    }
};

/**
 * Sends a response to the pre-signed S3 URL
 */
let sendResponse = function(event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
};

/**
 * Copy all the assets necessary for the web application
 */
let copyWebAssets = function(properties, callback) {
    // Download the manifest file
    let sourceS3Bucket = properties.SourceBucket;
    let sourceS3KeyPrefix = properties.SourcePrefixKey;
    let destS3Bucket = properties.DestBucket;
    let baseApi = properties.BaseApi;
    let apiKey = properties.ApiGatewayKey;
    let cognitoDomain = properties.CognitoDomain;
    let clientId = properties.ClientId;
    let userPoolId = properties.UserPoolId;
    let redirDomain = properties.RedirDomain;

    downloadWebisteManifest(sourceS3Bucket, sourceS3KeyPrefix + 'asset-manifest.json', function(err, data) {
        if (err) {
            console.log(err);
            return callback(err, null);
        }

        fs.readFile(_downloadLocation, 'utf8', function(err, data) {
            if (err) {
                console.log(err);
                return callback(err, null);
            }

            let _manifest = validateJSON(data);

            if (!_manifest) {
                return callback('Unable to validate downloaded manifest file JSON', null);
            } else {
                agw.getApiKey({ apiKey: apiKey, includeValue: true }, function (err, gwKey) { 
                    let fileList = getManifestFiles(_manifest.files);
                    uploadFile(fileList, 0, destS3Bucket, sourceS3Bucket, sourceS3KeyPrefix, baseApi, gwKey, cognitoDomain, clientId, userPoolId, redirDomain,
                        function(err, result) {
                            if (err) {
                                return callback(err, null);
                            }
    
                            return callback(null, 'success');
                        });
                });
            }
        });
    });
};

let downloadWebisteManifest = function(s3Bucket, s3Key, callback) {
    let params = {
        Bucket: s3Bucket,
        Key: s3Key
    };

    // check to see if the manifest file exists
    s3.headObject(params, function(err, metadata) {
        if (err) {
            console.log(err);
        }

        if (err && err.code === 'NotFound') {
            // Handle no object on cloud here
            return callback('Manifest file was not found.', null);
        } else {
            let file = require('fs').createWriteStream(_downloadLocation);

            s3.getObject(params).
                on('httpData', function(chunk) {
                    file.write(chunk);
                }).
                on('httpDone', function() {
                    file.end();
                    console.log('website manifest downloaded for processing...');
                    return callback(null, 'success');
                }).
                send();
        }
    });
};

let validateJSON = function(body) {
    try {
        let data = JSON.parse(body);
        return data;
    } catch (e) {
        // failed to parse
        console.log('Manifest file contains invalid JSON.');
        return null;
    }
};

let uploadFile = function(filelist, index, destS3Bucket, sourceS3Bucket, sourceS3prefix, baseApi, gwKey, cognitoDomain, clientId, userPoolId, redirDomain, cb) {
    if (filelist.length > index) {
        if (filelist[index].startsWith('static') && (filelist[index].endsWith('js') || filelist[index].endsWith('map'))) {
            let getObjectParams = {
                Bucket: sourceS3Bucket,
                Key: sourceS3prefix + filelist[index]
            };
            s3.getObject(getObjectParams, function (err, result) {
                let data = result.Body.toString('utf-8');
                data = data.replace(/__BASE_API__/g, baseApi).replace(/__API_KEY__/g, gwKey['value']).replace(/__C_DOMAIN__/g, cognitoDomain).replace(/__C_POOL__/g, userPoolId).replace(/__C_CLIENT_ID__/g, clientId).replace(/__C_REDIR__/g, redirDomain);
                
                let putObjectParams = {
                    Body: data,
                    Bucket: destS3Bucket,
                    Key: filelist[index],
                    ContentType: 'application/javascript'
                };
               
                s3.putObject(putObjectParams, function (err, result) {
                    if (err) {
                        console.log("Error putting: " + err);
                    }
                });
                
                let _next = index + 1;
                uploadFile(filelist, _next, destS3Bucket, sourceS3Bucket, sourceS3prefix, baseApi, gwKey, cognitoDomain, clientId, userPoolId, redirDomain,
                    function (err, resp) {
                        if (err) {
                            return cb(err, null);
                        }

                        cb(null, resp);
                });
            });
        } else {
            let params = {
                Bucket: destS3Bucket,
                Key: filelist[index],
                CopySource: sourceS3Bucket + "/" + sourceS3prefix + filelist[index],
                MetadataDirective: "REPLACE"
            };

            if (filelist[index].endsWith('.htm') || filelist[index].endsWith('.html')) {
                params.ContentType = "text/html";
            } else if (filelist[index].endsWith('.css')) {
                params.ContentType = "text/css";
            } else if (filelist[index].endsWith('.js')) {
                params.ContentType = "application/javascript";
            } else if (filelist[index].endsWith('.png')) {
                params.ContentType = "image/png";
            }

            s3.copyObject(params, function(err, data) {
                if (err) {
                    console.log(['error copying ', [sourceS3prefix, filelist[index]].join(''), '\n', err]
                        .join(''));
                } else {
                    console.log([
                        [sourceS3prefix, filelist[index]].join('/'), 'uploaded successfully'
                    ].join(' '));

                    let _next = index + 1;
                    uploadFile(filelist, _next, destS3Bucket, sourceS3Bucket, sourceS3prefix, baseApi, gwKey, cognitoDomain, clientId, userPoolId, redirDomain,
                        function (err, resp) {
                            if (err) {
                                return cb(err, null);
                            }

                            cb(null, resp);
                    });
                }
            });
        }
    } else {
        cb(null, [index, 'files copied'].join(' '));
    }

};

let getManifestFiles = function(fileListObject) {
    let fileList = ['asset-manifest.json', 'manifest.json', 'favicon.ico', 'robots.txt', 'images/ContactFlowIcon.png',
                    'images/ContactFlowIcon_2x.png', 'images/ContactFlowIcon_3x.png', 'images/logo80.png', 'images/logo80_2x.png'];
    for (var key in fileListObject) {
        fileList.push(fileListObject[key].substring(1));
    }
    return fileList;
}