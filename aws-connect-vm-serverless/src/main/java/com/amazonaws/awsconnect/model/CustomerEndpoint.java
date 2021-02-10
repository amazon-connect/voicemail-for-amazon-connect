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

package com.amazonaws.awsconnect.model;

import org.json.JSONObject;

public class CustomerEndpoint {

    private String address;
    private String type;

    public CustomerEndpoint(JSONObject jsonObject) {
        this.address = jsonObject.getString("Address");
        this.type = jsonObject.getString("Type");
    }

    public String getAddress() {
        return address;
    }

    public String getType() {
        return type;
    }
}
