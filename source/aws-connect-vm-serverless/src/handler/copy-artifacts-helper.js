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
    console.log("Event: " + JSON.stringify(event));
    let responseStatus = 'FAILED';
    let responseData = {};
    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'copyObjects') {
            copyObjects(event.ResourceProperties.SourceBucket,
                event.ResourceProperties.DestBucket,
                event.ResourceProperties.Prefix,
                event.ResourceProperties.Objects,
                0,
                function(err, data) {
                  if (err) {
                      responseData = {
                          Error: 'Copy objects function failed'
                      };
                      console.log([responseData.Error, ':\n', err].join(''));
                    } else {
                        getObjectVersion(event.ResourceProperties.DestBucket,
                            function(err, data) {
                            if (err) {
                                responseData = {
                                    Error: 'Get S3 Object Version function failed'
                                };
                                console.log([responseData.Error, ':\n', err].join(''));
                            } else {
                                responseStatus = 'SUCCESS';
                                responseData = {
                                    "JarVersionId": data.LatestJarObjectVersion,
                                    "ZipVersionId": data.LatestZipObjectVersion
                                };
                    }
                            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                        });
                }
            });
        } else if (event.ResourceProperties.customAction === 'cleanUpS3Bucket') {
            responseStatus = 'SUCCESS';
            responseData = {};
            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
        }
    } else if (event.RequestType === 'Delete') {
        if (event.ResourceProperties.customAction === 'cleanUpS3Bucket') {
            cleanUpS3Bucket(event.ResourceProperties,
                function(err, data) {
                  if (err) {
                      responseData = {
                          Error: 'Clean up S3 bucket function failed'
                      };
                      console.log([responseData.Error, ':\n', err].join(''));
                  } else {
                      responseStatus = 'SUCCESS';
                      responseData = {};
                  }
                  sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
              });
        }
        responseStatus = 'SUCCESS';
        sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
    } else if (event.ResourceProperties.customAction === 'copyObjects') {
        deleteVersionedObjects(event.ResourceProperties.DestBucket,
            function(err, data) {
              if (err) {
                  responseData = {
                      Error: 'Delete objects function failed'
                  };
                  console.log([responseData.Error, ':\n', err].join(''));
              } else {
                  copyObjects(event.ResourceProperties.SourceBucket,
                    event.ResourceProperties.DestBucket,
                    event.ResourceProperties.Prefix,
                    event.ResourceProperties.Objects,
                    0,
                    function(err, data) {
                      if (err) {
                          responseData = {
                              Error: 'Copy objects function failed'
                          };
                          console.log([responseData.Error, ':\n', err].join(''));
                      } else {
                            getObjectVersion(event.ResourceProperties.DestBucket,
                                function(err, data) {
                                if (err) {
                                    responseData = {
                                        Error: 'Get S3 Object Version function failed'
                                    };
                                    console.log([responseData.Error, ':\n', err].join(''));
                                } else {
                                    responseStatus = 'SUCCESS';
                                    responseData = {
                                        "JarVersionId": data.LatestJarObjectVersion,
                                        "ZipVersionId": data.LatestZipObjectVersion
                                    };
                                }
              
                                sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                            });
                    }
                  });
                     
              }
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
let cleanUpS3Bucket = function(properties, callback) {
    var params = {
        Bucket: properties.DestBucket
    };
    s3.getBucketVersioning(params, function(err, checkIfVersioned) {
        if (err) {
            console.log("Error getting the bucket version: " + err);
            return callback(err, null);
        }
        if (checkIfVersioned.Status) {
            console.log("This is a versioned Bucket");
            deleteVersionedObjects(properties.DestBucket, callback);
        } else {
            console.log("This is not a versioned bucket");
            deleteNonVersionedObjects(properties.DestBucket, callback);
        }
        return callback(null, 'success');
    });
};
let deleteVersionedObjects = function(destBucket, callback) {
    var params = {
        Bucket: destBucket
    };
    s3.listObjectVersions(params, function (err, data) {
        if (err) {
            console.log("error listing bucket objects "+err);
            return;
        }
        var objects = [];
      
        var versionItems = data.Versions;
        for (var i = 0; i < versionItems.length; i += 1) {
            objects.push({'Key': versionItems[i].Key, 'VersionId': versionItems[i].VersionId});
        }
        var deleteMarkerItems = data.DeleteMarkers;
        for (var i = 0; i < deleteMarkerItems.length; i += 1) {
            objects.push({'Key': deleteMarkerItems[i].Key, 'VersionId': deleteMarkerItems[i].VersionId});
            console.log("deleteMarkerItemKey: " + deleteMarkerItems[i].Key + " deleteMarkerItemId: " + deleteMarkerItems[i].VersionId);
        }
        var deleteParams = {'Bucket': destBucket, 'Delete': {'Objects': objects}};
        s3.deleteObjects(deleteParams, function(err, deleteData) {
            if (err) {
                console.log("error deleting objects " + err);
                return callback(err, null);
            }
            callback(null, 'success');
        });
    });
};
let deleteNonVersionedObjects = function(destBucket, callback) {
    var params = {
        Bucket: destBucket
    };
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log("error listing bucket objects "+err);
            return;
        }
        var items = data.Contents;
        var objects = [];
      
        for (var i = 0; i < items.length; i += 1) {
            objects.push({'Key': items[i].Key});
        }
        var deleteParams = {'Bucket': bucket, 'Objects': objects};
        s3.deleteObjects(deleteParams, function(err, deleteData) {
            if (err) {
                console.log("error deleting objects " + err);
                return callback(err, null);
            }
            callback(null, 'success');
        });
    });
};
let copyObjects = function(sourceBucket, destBucket, prefix, objectList, index, callback) {
    if (objectList.length > index) {
        let destKey = 'aws-connect-vm-serverless/' + objectList[index];
        let copySource = sourceBucket + "/" + prefix + objectList[index];
        let params = {
            'CopySource': copySource,
            'Bucket': destBucket,
            'Key': destKey
        };
        s3.copyObject(params, function(err, data) {
            if (err) {
                console.log("Error copying file: " + err);
            }
            copyObjects(sourceBucket, destBucket, prefix, objectList, index + 1, function (err, resp) {
                if (err) {
                    console.log("Error copying object: " + objectList[index + 1] + " " + err);
                    return callback(err, null);
                }
                callback(null, resp);
            });
        });
    } else {
        callback(null, [index, 'files copied'].join(' '));
    }
};
let getObjectVersion = function(destBucket, callback) {
    var params = {
        Bucket: destBucket
    };
    s3.listObjectVersions(params, function (err, data) {
        if (err) {
            console.log("error listing bucket objects "+err);
            return;
        }
        var VersionObject = {};
      
        var versionItems = data.Versions;
        for (var i = 0; i < versionItems.length; i += 1) {
            if (versionItems[i].Key === 'aws-connect-vm-serverless/aws-connect-vm-java.jar') {
                VersionObject["LatestJarObjectVersion"] = versionItems[i].VersionId;
            } else if (versionItems[i].Key === 'aws-connect-vm-serverless/aws-connect-vm.zip') {
                VersionObject["LatestZipObjectVersion"] = versionItems[i].VersionId;
            }
        }
        return callback(null, VersionObject);
    });
};
