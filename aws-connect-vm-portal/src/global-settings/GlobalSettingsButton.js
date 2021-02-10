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
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {IconButton} from "@material-ui/core";
import {Settings} from "@material-ui/icons";
import requiresAuth from "../common/requiresAuth";
import {GlobalSettingsAction} from "../store/actions/global-settings.actions";

class GlobalSettingsButton extends Component {

    handleButtonClick = () => {
        this.props.showGlobalSettingsModal === false ? this.props.showSettingsModal(true) : this.props.showSettingsModal(false);
    };

    render() {
        return (
            <IconButton color="inherit" onClick={this.handleButtonClick}>
                <Settings/>
            </IconButton>
        )
    }
}

GlobalSettingsButton.propTypes = {
    showGlobalSettingsModal: PropTypes.bool
};

const mapStateToProps = (state) => {
    return {
        showGlobalSettingsModal: state.globalSettings.showModal
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        showSettingsModal: (show) => dispatch(GlobalSettingsAction.showModal(show)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(GlobalSettingsButton);