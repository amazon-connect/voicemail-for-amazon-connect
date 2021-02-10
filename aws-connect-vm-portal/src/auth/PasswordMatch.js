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
import {Grid, TextField} from "@material-ui/core";
import PropTypes from 'prop-types';

class PasswordMatch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            upperField: "",
            lowerField: ""
        }
    }

    handleOldPasswordField = (event) => {
        this.setState({
            ...this.state,
            oldPassword: event.target.value
        }, () => {
            this.validateFields();
        });
    };

    handleUpperField = (event) => {
        this.setState({
            ...this.state,
            upperField: event.target.value
        }, () => {
            this.validateFields();
        });
    };

    handleLowerField = (event) => {
        this.setState({
            ...this.state,
            lowerField: event.target.value
        }, () => {
            this.validateFields();
        });
    };

    validateFields = () => {
        if (this.props.validated) {
            let valid = this.isValid();
            this.props.validated({
                valid,
                reason: "",
                newPassword: this.state.upperField,
                oldPassword: this.state.oldPassword
            });
        }
    };

    isValid = () => {
        if (this.state.upperField === "" || this.state.lowerField === "") {
            return false
        }
        return this.state.upperField === this.state.lowerField;
    };

    newPasswordError = () => {
        if (this.state.lowerField !== "") {
            return !this.isValid();
        }
        return false;
    };

    render() {
        return(
            <Grid container>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="no"
                        required
                        fullWidth
                        name="oldPassword"
                        label="Old Password"
                        type="password"
                        id="oldPassword"
                        onChange={this.handleOldPasswordField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="no"
                        required
                        fullWidth
                        name="upperField"
                        label={this.props.upperFieldLabel}
                        type="password"
                        id="upperField"
                        onChange={this.handleUpperField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoComplete="no"
                        required
                        fullWidth
                        name="lowerField"
                        label={this.props.lowerFieldLabel}
                        type="password"
                        id="lowerField"
                        error={this.newPasswordError()}
                        onChange={this.handleLowerField}
                    />
                </Grid>
            </Grid>
        )
    }

}

PasswordMatch.propTypes = {
    validated: PropTypes.func,
    upperFieldLabel: PropTypes.string,
    lowerFieldLabel: PropTypes.string
};

export default PasswordMatch;