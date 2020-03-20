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
import {Auth, Hub} from 'aws-amplify';
import history from "../history";

class CognitoAuth extends Component {
  constructor(props) {
    super(props);

    // let the Hub module listen on Auth events
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signIn':
          history.push('/agents');
          this.setState({authState: 'signedIn', authData: data.payload.data});
          break;
        case 'signIn_failure':
          break;
        default:
          break;
      }
    });
  }

  componentDidMount() {
    // we only want to do this if code isn't
    if (!this.props.location || !this.props.location.search.startsWith("?code=")) {
      Auth.currentAuthenticatedUser().then(user => {
        history.push('/agents');
      }).catch(e => {
        Auth.federatedSignIn();
      });
    }
  }

  render() {
    return (
        <div className="App"/>
    );
  }
}

export default CognitoAuth;