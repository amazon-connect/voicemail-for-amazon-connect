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

import React from 'react';
import {connect} from 'react-redux';
import history from "../history";
import AuthRoles from "../auth/AuthRoles";
import {Auth} from "aws-amplify";
import {AuthAction} from "../store/actions/auth.actions";

export default function (ComposedComponent, protectedBy=AuthRoles.MANAGER) {
    class Authenticate extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                authState: 'loading'
            }
        }

        componentDidMount() {
            this._checkAndRedirect();
        }

        componentDidUpdate() {
            this._checkAndRedirect();
        }

        _checkAndRedirect() {
            if (this.state.authState === "loading") {
                Auth.currentAuthenticatedUser().then(user => {
                    // console.log(user);
                    this.props.auth(user);
                    this.setState({authState: 'valid'});
                }).catch(e => {
                    // console.log("fail");
                    this.setState({authState: 'invalid'});
                    this.props.redirect();
                });
            }
        }

        render() {
            return this.state.authState === 'valid' ? <ComposedComponent {...this.props} /> : <div />;
        }

        hasRole(protectedBy) {
            if (this.props.auth.user.roles) {
                return this.props.auth.user.roles.includes(protectedBy)
            } else {
                return false
            }
        }
    }

    const mapStateToProps = (state) => {
        return {
            auth: state.auth
        };
    };

    const mapDispatchToProps = (dispatch) => {
        return {
            redirect: () => dispatch(() => {history.push("/login")}),
            auth: (user) => dispatch(AuthAction.auth(user))
        }
    };

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(Authenticate);
}
