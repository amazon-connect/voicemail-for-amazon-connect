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

export const CloudFormationResponse = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED"
};

/**
 *
 * @param event
 * @param context
 * @param responseStatus
 * @param physicalResourceId
 * @param responseData
 * @param noEcho
 * @returns {Promise<object>}
 */
export function sendCloudFormationResponse(event, context, responseStatus, physicalResourceId, responseData = {}, noEcho = false) {
    return new Promise((resolve, reject) => {
        let reason = "";
        if (responseStatus === 'FAILED') {
            reason = `See details in CloudWatch Stream ${context.logStreamName}`;
        }

        let responseBody = JSON.stringify({
            Status: responseStatus,
            Reason: reason,
            PhysicalResourceId: physicalResourceId || context.logStreamName,
            StackId: event.StackId,
            RequestId: event.RequestId,
            LogicalResourceId: event.LogicalResourceId,
            NoEcho: noEcho,
            Data: responseData
        });

        let https = require('https');
        let url = require('url');
        let parsedUrl = url.parse(event.ResponseURL);
        let options = {
            hostname: parsedUrl.hostname,
            port: 443,
            path: parsedUrl.path,
            method: "PUT",
            headers: {
                "content-type": "",
                "content-length": responseBody.length
            }
        };

        let request = https.request(options, (response) => {
            resolve({
                statusCode: response.statusCode,
                statusMessage: response.statusMessage
            });
        });

        request.on("error", (error) => {
            console.log(JSON.stringify(error, null, 2));
            reject("send(..) failed executing https.request(..): " + error);
        });

        request.write(responseBody);
        request.end();
    });


}

