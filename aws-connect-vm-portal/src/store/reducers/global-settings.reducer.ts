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

import {GlobalSettingsActionKey} from "../actions/global-settings.actions";
import {Reducer} from "redux";


const initialState = {
    showModal: false,
    transcribeVoicemail: false,
    encryptVoicemail: false,
    deliveryEmail: "",
    loading: false,
    saving: false,
    availableSMSCountries: ["us"]
};

const reducer: Reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case GlobalSettingsActionKey.SHOW_GLOBAL_SETTINGS_MODAL:
            return {
                ...state,
                showModal: action.value
            };
        case GlobalSettingsActionKey.FETCH_SETTINGS:
            return {
                ...state,
                ...action.value
            };
        case GlobalSettingsActionKey.SETTINGS_LOADING:
            return {
                ...state,
                loading: action.value
            };
        case GlobalSettingsActionKey.SAVE_SETTINGS:
            return {
                ...state,
                ...action.value
            };
        case GlobalSettingsActionKey.SAVE_IN_PROGRESS:
            return {
                ...state,
                saving: action.value
            };
        default: {
            return state;
        }
    }
};

export default reducer