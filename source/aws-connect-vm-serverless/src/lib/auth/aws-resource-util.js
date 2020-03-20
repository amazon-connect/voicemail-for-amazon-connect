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

class AwsApiGatewayResource {
    constructor(resource){
        let resourceComponents = resource.split(':');
        let apiGatewayArnTmp = resourceComponents[5].split('/');
        this.accountId = resourceComponents[4];
        this.region = resourceComponents[3];
        this.restApiId = apiGatewayArnTmp[0];
        this.stage = apiGatewayArnTmp[1];
        this.apiOptions = {
            region: this.region,
            restApiId: this.restApiId,
            stage: this.stage
        };
        this.pathComponents = apiGatewayArnTmp;
    }
}

class AwsResourceUtil {
    static parseApiGatewayResource(resource) {
        return new AwsApiGatewayResource(resource);
    }
}

export {AwsResourceUtil};
