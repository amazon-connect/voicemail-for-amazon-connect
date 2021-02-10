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

import {ApiService} from "../../service/api.service";
import history from "../../history";
import AuthService from "../../service/auth.service";
import {Dispatch} from "redux";
import {UserInterface} from "../../interface/user.interface";
import {CognitoUser} from "amazon-cognito-identity-js";

const apiService = new ApiService();
const authService = new AuthService(apiService);

const AuthActionKey = {
    LOGIN_PENDING: "LOGIN_PENDING",
    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
    LOGIN_ERROR: "LOGIN_ERROR"
};

const loginResults = (authenticated: boolean, user: UserInterface) => {
    return {
        type: AuthActionKey.LOGIN,
        value: {
            isAuthenticated: authenticated,
            user
        }
    }
};

const loginErrorResults = (error: any) => {
    return {
        type: AuthActionKey.LOGIN_ERROR,
        value: {
            error
        }
    }
};

const logoutResults = () => {
    return {
        type: AuthActionKey.LOGOUT
    }
};

const AuthAction = {
    auth: (user: CognitoUser) => {
        return (dispatch: Dispatch) => {
            let payload = user.getSignInUserSession()!.getIdToken().decodePayload();
            dispatch(loginResults(true, {
                email: payload['email'],
                roles: payload['cognito:groups']
            }));
        };
    },
    logout: () => {
        return (dispatch: Dispatch) => {
            authService.logout();
            // dispatch(logoutResults());
            // dispatch(loginErrorResults(null));
            // history.push('/login');
        }
    }
};

export {AuthActionKey, AuthAction}