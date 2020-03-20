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

import {GenericError} from "./standard.errors";

class ExtensionNumberRequiredError extends GenericError {
    constructor() {
        super(
            "ExtensionNumberRequiredError",
            "Please provide an extension number.",
            "Extension number is required to update an agent"
        );
    }
}

class ExtensionInUseError extends GenericError {
    constructor(extension) {
        super(
            "ExtensionInUseError",
            "Extension already in use. Please provide a different extension number.",
            `Cannot have more than one user assigned to the extension number: ${extension}`
        );
    }
}

export {
    ExtensionNumberRequiredError,
    ExtensionInUseError
};