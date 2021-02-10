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

const ALLOW_ORIGIN_HEADER = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'DENY'
};

function Response(statusCode, body = {}, cors = false, customHeaders = null) {
    let response = {
        statusCode,
        body: JSON.stringify(body)
    };

    if (cors) {
        response["headers"] = ALLOW_ORIGIN_HEADER;
    }

    if (customHeaders) {
        let headers = response["headers"];
        headers = {
            ...headers,
            ...customHeaders
        };
        response["headers"] = headers;
    }

    return response;
}

function Error(statusCode, error, description, cors = false) {
    console.log(error, (error instanceof Error), error.toString());
    let errorMessage = "";
    let errorName = "Error";
    let errorStack = "";
    let developerMessage = "";

    if (error.hasOwnProperty("message")) {
        errorMessage = error.message;
    }
    if (error.hasOwnProperty("name")) {
        errorName = error.name;
    }
    if (error.hasOwnProperty("stack")) {
        errorStack = error.stack;
    }

    if (error.hasOwnProperty("developerMessage")) {
        developerMessage = error.developerMessage;
    }

    let response = {
        statusCode,
        body: JSON.stringify({
            errorMessage: description,
            // Uncomment the following lines for descriptive error messages.
            /*_error: {
                message: errorMessage,
                name: errorName,
                stack: errorStack,
                developerMessage
            }*/
        })
    };

    if (cors) {
        response["headers"] = ALLOW_ORIGIN_HEADER;
    }

    console.log("Error:", response);
    return response;
}

const Responder = {
    Response,
    Error
};

export {Responder};
