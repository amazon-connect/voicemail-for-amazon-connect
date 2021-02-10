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

import {GlobalSettingsService} from "../../service/global-settings.service";
import {ApiService} from "../../service/api.service";
import {Dispatch} from "redux";
import {GlobalSettingsInterface} from "../../interface/global-settings.interface";
import {AgentInterface} from "../../interface/agent.interface";

const globalSettingsService = new GlobalSettingsService(new ApiService());

const GlobalSettingsActionKey = {
    SHOW_GLOBAL_SETTINGS_MODAL: "SHOW_MODAL",
    SETTINGS_LOADING: "LOADING",
    SAVE_IN_PROGRESS: "SAVE_IN_PROGRESS",
    SAVE_SETTINGS: "SAVE_SETTINGS",
    FETCH_SETTINGS: "FETCH_SETTINGS"
};

const showModalResults = (agent: AgentInterface) => {
    return {
        type: GlobalSettingsActionKey.SHOW_GLOBAL_SETTINGS_MODAL,
        value: agent
    }
};

const loadingResults = (loading: boolean) => {
    return {
        type: GlobalSettingsActionKey.SETTINGS_LOADING,
        value: loading
    }
};

const savingResults = (saving: boolean) => {
    console.log("Saving", saving);
    return {
        type: GlobalSettingsActionKey.SAVE_IN_PROGRESS,
        value: saving
    }
};

const fetchSettingsResult = (settings: GlobalSettingsInterface) => {
    return {
        type: GlobalSettingsActionKey.FETCH_SETTINGS,
        value: {
            ...settings
        }
    }
};

const saveSettingsResult = (settings: GlobalSettingsInterface) => {
    return {
        type: GlobalSettingsActionKey.SAVE_SETTINGS,
        value: {
            ...settings
        }
    }
};

const GlobalSettingsAction = {
    showModal: (agent: AgentInterface) => {
        return (dispatch: Dispatch) => {
            dispatch(showModalResults(agent))
        }
    },
    fetchSettings: () => {
        return (dispatch: Dispatch) => {
            dispatch(loadingResults(true));
            globalSettingsService.getSettings()
                .then(settings => {
                    dispatch(fetchSettingsResult(settings));
                })
                .catch(err => {
                    // TODO: Handle Error
                    console.log(err);
                })
                .finally(() => {
                    dispatch(loadingResults(false));
                })
        }
    },
    saveSettings: (settings: GlobalSettingsInterface) => {
        return (dispatch: Dispatch) => {
            dispatch(savingResults(true));
            globalSettingsService.saveSettings(settings)
                .then(settings => {
                    dispatch(saveSettingsResult(settings));
                })
                .catch(err => {
                    // TODO: Handle Error
                    console.log(err);
                })
                .finally(() => {
                    dispatch(savingResults(false));
                })
        }
    }
};

export {GlobalSettingsActionKey, GlobalSettingsAction}