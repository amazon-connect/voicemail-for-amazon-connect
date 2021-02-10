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

import {ContactFlowActionKey} from "../actions/contact-flow.actions";
import {Reducer} from "redux";

const initialState = {
    showModal: false,
    downloading: false,
    downloadError: null
};

const reducer: Reducer = (state = initialState, action: any) => {
    switch (action.type) {
        case ContactFlowActionKey.DOWNLOADING:
            return {
                ...state,
                downloading: action.value
            };
        case ContactFlowActionKey.DOWNLOAD_ERROR:
            let errorMessage = null;

            if (action.value && action.value.error) {
                errorMessage = action.value.error._error.message;
            }
            return {
                ...state,
                downloadError: errorMessage
            };
        case ContactFlowActionKey.SHOW_CONTACT_FLOW_MODAL:
            return {
                ...state,
                showModal: action.value
            };
        default:
            return state;
    }
};

export default reducer;