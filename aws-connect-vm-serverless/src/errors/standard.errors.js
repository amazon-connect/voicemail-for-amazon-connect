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

class GenericError extends Error {
    constructor(name, message, developerMessage) {
        super();
        this.message = message;
        this.developerMessage = developerMessage;
        this.name = name;
    }
}

class MissingParameterError extends GenericError {
    constructor(parameter) {
        super(
            "MissingParameterError",
            `Missing parameter`,
            `Missing parameter: ${parameter}`
        );
    }
}

class InvalidParameterError extends GenericError {
    constructor(message, developerMessage) {
        super(
            "InvalidParameterValueError",
            message,
            developerMessage
        );
    }
}

class MissingParametersError extends GenericError {
    constructor() {
        super(
            "MissingParametersError",
            `One or more parameters are missing`,
            `You have one ore more parameters miss, please see documentation for more information.`
        );
    }
}

export {
    GenericError,
    MissingParameterError,
    InvalidParameterError,
    MissingParametersError
};