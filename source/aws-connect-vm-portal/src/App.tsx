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
import {
    Switch,
    Route,
    Redirect,
    Router
} from 'react-router-dom';
import {withStyles} from "@material-ui/core";
import Amplify from 'aws-amplify';

import history from "./history";
import CognitoAuth from './auth/CognitoAuth';
import Contacts from "./agents/Agents";
import globalStyles from './theme/global.styles';

Amplify.configure({
    Auth: {
        region: process.env.REACT_APP_REGION,
        userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
        oauth: {
            domain: process.env.REACT_APP_COGNITO_DOMAIN,
            scope: ['profile', 'openid'],
            redirectSignIn: process.env.REACT_APP_COGNITO_REDIRECT,
            redirectSignOut: process.env.REACT_APP_COGNITO_REDIRECT,
            responseType: 'code'
        }
    }
});

class App extends Component {
    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Route exact path="/login" component={CognitoAuth}/>
                    <Route path="/agents" component={Contacts}/>
                    <Route exact path="/" component={CognitoAuth}/>
                    <Redirect from="/*" exact to="/agents" />
                </Switch>
            </Router>
        )
    }
}

export default withStyles(globalStyles)(App);