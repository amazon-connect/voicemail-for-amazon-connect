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

import React, {Component} from 'react';
import NavigationBar from "../navigation/NavigationBar";
import requiresAuth from "../common/requiresAuth";

class AgentsNoAuth extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div>
                <NavigationBar/>
                <p> The user you logged in with is not valid. Log in again and contact your administrator if you continue to see an issue.</p>
            </div>
        )
    }
}

export default AgentsNoAuth;