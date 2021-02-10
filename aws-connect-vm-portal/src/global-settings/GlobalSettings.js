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
import {Paper, withStyles, Button, Grid, FormControlLabel, Checkbox, TextField} from "@material-ui/core";
import AsyncButton from "../common/components/AsyncButton";
import {GlobalSettingsAction} from "../store/actions/global-settings.actions";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import ContactFlow from "../contact-flow/ContactFlow";
import AuthRoles from "../auth/AuthRoles";

const styles = (theme) => ({
    root: {
        padding: 0
    },
    title: {
        fontSize: 25,
        padding: 0,
        margin: 0
    },
    paper: {
        padding: 20,
        width: 450
    },
    checkBox: {
        marginTop: 15,
        marginBottom: 15
    },
    deliveryEmail: {
        marginTop: 15
    },
    infoCaption: theme.infoCaption,
    spacer: {
        marginTop: "20px",
        marginBottom: "10px",
        borderBottom: "1px solid rgb(220, 220, 220, 0.5)"
    }
});

class GlobalSettings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            deliveryEmail: "",
            transcribeEnabled: null,
            encryptionEnabled: null
        }
    }

    componentDidMount() {
        this.props.fetch();
    }

    handleEventInputChange = (event) => {
        let {name} = event.target;
        if (name === "deliveryEmail") {
            this.setState({
                ...this.state,
                [event.target.name]: event.target.value
            })
        } else {
            this.setState({
                ...this.state,
                [event.target.name]: event.target.checked
            })
        }

    };

    handleSave = () => {
        let settings = {
            transcribeVoicemail: this.state.transcribeEnabled !== null ? this.state.transcribeEnabled : this.props.transcribeVoicemail,
            encryptVoicemail: this.state.encryptionEnabled !== null ? this.state.encryptionEnabled : this.props.encryptVoicemail,
            deliveryEmail: this.state.deliveryEmail === "" ? this.props.deliveryEmail : this.state.deliveryEmail,
            availableSMSCountries: this.props.availableSMSCountries
        };
        this.props.save(settings);
        this.props.showModal(false);
    };

    render() {

        let classes = this.props.classes;

        let transcribe = this.state.transcribeEnabled;
        if (this.state.transcribeEnabled === null) {
            transcribe = this.props.transcribeVoicemail
        }

        let encrypt = this.state.encryptionEnabled;
        if (this.state.encryptionEnabled === null) {
            encrypt = this.props.encryptVoicemail
        }

        return (
            <div className={classes.root}>
                <h6 className={classes.title}>Global Configurations</h6>
                <div className={classes.checkBox}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="transcribeEnabled"
                                id="transcribe"
                                disabled={this.props.loading || this.props.saving}
                                onChange={this.handleEventInputChange}
                                checked={transcribe}
                                color="primary"/>
                        }
                        label="Allow Voicemail Transcriptions"/>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="encryptionEnabled"
                                id="encrypt"
                                disabled={this.props.loading || this.props.saving}
                                onChange={this.handleEventInputChange}
                                checked={encrypt}
                                color="primary"/>
                        }
                        label="Enforce Voicemail Encryption"/>
                    <TextField
                        name="deliveryEmail"
                        disabled={this.props.loading || this.props.saving}
                        className={classes.deliveryEmail}
                        fullWidth={true}
                        placeholder={this.props.deliveryEmail}
                        onChange={this.handleEventInputChange}
                        value={this.state.deliveryEmail || this.props.deliveryEmail}
                        label={"Delivery Email"}
                    />
                    <p className={classes.infoCaption}>Important: Delivery Email must be verified via Amazon Simple
                        Email Service before emails can be delivered</p>
                </div>
                <Grid container spacing={5} direction="row">
                    <Grid item>
                        <Button color="secondary" onClick={() => {
                            this.props.showModal(false)
                        }}>Cancel</Button>
                    </Grid>
                    <Grid item>
                        <AsyncButton loading={this.props.saving} color="primary" variant="contained" disabled={this.props.userRole != "Administrator"} onClick={this.handleSave}>Save</AsyncButton>
                    </Grid>
                </Grid>
                <div className={classes.spacer}></div>
                <ContactFlow/>
            </div>
        )
    }
}

GlobalSettings.propTypes = {
    loading: PropTypes.bool,
    deliveryEmail: PropTypes.string,
    transcribeVoicemail: PropTypes.bool,
    encryptVoicemail: PropTypes.string,
    saving: PropTypes.bool,
    fetch: PropTypes.func,
    showModal: PropTypes.func,
    save: PropTypes.func
};

const mapStateToProps = (state) => {
    let role = "";
    if (!state.auth.user) {
        return {
            userEmail: null,
            userRole: null
        }
    }

    let roles = state.auth.user["roles"];
    if (roles.includes(AuthRoles.MANAGER)) {
        role = "Manager";
    }

    if (roles.includes(AuthRoles.ADMIN)) {
        role = "Administrator"
    }

    return {
        loading: state.globalSettings.loading,
        deliveryEmail: state.globalSettings.deliveryEmail || "",
        transcribeVoicemail: state.globalSettings.transcribeVoicemail,
        encryptVoicemail: state.globalSettings.encryptVoicemail,
        availableSMSCountries: state.globalSettings.availableSMSCountries,
        saving: state.globalSettings.saving,
        userRole: role
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetch: () => dispatch(GlobalSettingsAction.fetchSettings()),
        showModal: (show) => dispatch(GlobalSettingsAction.showModal(show)),
        save: (settings) => dispatch(GlobalSettingsAction.saveSettings(settings))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GlobalSettings))