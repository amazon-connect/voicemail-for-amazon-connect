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
    Paper, withStyles,
    Button, Grid,
    FormControlLabel, Checkbox, TextField, FormControl, Input, InputLabel
} from "@material-ui/core";
import {connect} from "react-redux";
import AsyncButton from "../common/components/AsyncButton";
import {AgentsAction} from "../store/actions/agents.actions";
import PropTypes from 'prop-types';
import MuiPhoneInput from 'material-ui-phone-number';
import PhoneNumber from 'awesome-phonenumber';

const styles = (theme) => ({
    ...theme.modal,
    userInfo: {
        marginTop: 20
    },
    paper: {
        padding: 20,
        width: 350
    },
});

const FormControlCheckBox = ({label, checked, onChange, name, id, color = "primary"}) => {
    return (
        <FormControlLabel
            control={
                <Checkbox
                    name={name}
                    id={id}
                    onChange={onChange}
                    checked={checked}
                    color="primary"/>
            }
            label={label}/>
    )
};

class AgentSettings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            transcribeVoicemail: null,
            encryptVoicemail: null,
            deliverSMS: null,
            deliverEmail: null,
            extensionNumber: null,
            deliverSMSPhoneNumber: null,
            validationError: null
        }
    }

    handleCheckBoxChange = (event) => {
        this.setState({
            ...this.state,
            [event.target.name]: event.target.checked
        })
    };

    handleExtensionNumberChange = (event) => {
        const re = /^[0-9\b]+$/;
        if (event.target.value === '' || re.test(event.target.value)) {
            this.setState({
                ...this.state,
                [event.target.name]: event.target.value
            })
        }
    };

    phoneNumberInputChange = (phoneNumber, data) => {
        this.setState({
            ...this.state,
            countryData: data,
            deliverSMSPhoneNumber: phoneNumber
        })
    };

    formValueForKey(key, defaultValue) {
        let result = this.state[key];
        if (result === null) {
            result = defaultValue
        }
        return result;
    }

    handleSave = () => {
        let {transcribeVoicemail, encryptVoicemail, deliverSMS, deliverEmail, extensionNumber, deliverSMSPhoneNumber, } = this.state;

        deliverSMS = (deliverSMS !== null) ? deliverSMS : this.props.agent.deliverSMS;
        deliverSMSPhoneNumber = (deliverSMSPhoneNumber !== null) ? deliverSMSPhoneNumber : this.props.agent.deliverSMSPhoneNumber;
        extensionNumber = (extensionNumber !== null) ? extensionNumber : this.props.agent.extension;
        deliverEmail = (deliverEmail !== null) ? deliverEmail : this.props.agent.deliverEmail;
        encryptVoicemail = (encryptVoicemail != null) ? encryptVoicemail : this.props.agent.encryptVoicemail;
        transcribeVoicemail = (transcribeVoicemail != null) ? transcribeVoicemail : this.props.agent.transcribeVoicemail;

        if (deliverSMS) {
            let phone = new PhoneNumber(deliverSMSPhoneNumber);
            if (!phone.isValid()) {
                this.setState({
                    ...this.state,
                    validationError: "Please provide a valid phone number."
                });
                return;
            }
            deliverSMSPhoneNumber = phone.getNumber();
        } else {
            deliverSMSPhoneNumber = "";
        }

        this.props.updateAgent(
            this.props.agent.userId,
            extensionNumber,
            deliverSMSPhoneNumber,
            deliverSMS,
            deliverEmail,
            encryptVoicemail,
            transcribeVoicemail
        );
    };

    render() {
        let classes = this.props.classes;

        let transcribe = this.formValueForKey("transcribeVoicemail", this.props.agent.transcribeVoicemail);
        let encrypt = this.formValueForKey("encryptVoicemail", this.props.agent.encryptVoicemail);
        let deliverEmail = this.formValueForKey("deliverEmail", this.props.agent.deliverEmail);
        let deliverSMS = this.formValueForKey("deliverSMS", this.props.agent.deliverSMS);
        let extensionNumber = this.formValueForKey("extensionNumber", this.props.agent.extension);
        let deliverSMSPhoneNumber = this.formValueForKey("deliverSMSPhoneNumber", this.props.agent.deliverSMSPhoneNumber);

        return (
            <div>
                <h6 className={classes.title}>Agent Voicemail Settings</h6>
                <Grid className={classes.userInfo} container direction={"column"}>
                    <FormControl>
                        <InputLabel htmlFor="agent-name">Name</InputLabel>
                        <Input id="agent-name" disableUnderline={true} readOnly={true} value={this.props.agent.firstName + " " + this.props.agent.lastName}/>
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="phone-type">Email</InputLabel>
                        <Input id="agent-email" disableUnderline={true} readOnly={true} value={this.props.agent.email ? this.props.agent.email : this.props.agent.username}/>
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="phone-type">Phone Type</InputLabel>
                        <Input id="phone-type" disableUnderline={true} readOnly={true} value={this.props.agent.phoneType}/>
                    </FormControl>
                    {this.props.agent.phoneType === "Desk Phone" ?
                        <FormControl>
                            <InputLabel htmlFor="phone-number">Phone Number</InputLabel>
                            <Input id="phone-number" disableUnderline={true} readOnly={true} value={this.props.agent.phoneNumber}/>
                        </FormControl> : null
                    }
                </Grid>
                <div>
                    <Grid className={classes.padTop} container direction="row" justify="flex-start">
                        <Grid item>
                            <FormControlCheckBox label="Transcribe" name="transcribeVoicemail" id="transcribe"
                                                 onChange={this.handleCheckBoxChange} checked={transcribe}/>
                        </Grid>
                        <Grid item>
                            <FormControlCheckBox label="Encrypt" name="encryptVoicemail" id="encrypt"
                                                 onChange={this.handleCheckBoxChange} checked={encrypt}/>
                        </Grid>
                    </Grid>
                    <TextField
                        name="extensionNumber"
                        inputProps={{ maxlength: "5" }}
                        disabled={this.props.loading || this.props.saving}
                        className={classes.textField}
                        fullWidth={true}
                        onChange={this.handleExtensionNumberChange}
                        value={extensionNumber || ""}
                        label={"Extension"}/>
                    <p>Delivery Options</p>
                    <Grid container direction="column" justify="flex-start">
                        <Grid item>
                            <FormControlCheckBox label="Email" name="deliverEmail" id="deliverEmail"
                                                 onChange={this.handleCheckBoxChange} checked={deliverEmail}/>
                        </Grid>
                        <Grid item>
                            <FormControlCheckBox label="SMS" name="deliverSMS" id="deliverSMS"
                                                 onChange={this.handleCheckBoxChange} checked={deliverSMS}/>
                        </Grid>
                    </Grid>
                    {deliverSMS ?
                        <MuiPhoneInput
                            placeholder="Phone Number for SMS"
                            onChange={this.phoneNumberInputChange}
                            defaultCountry={'us'}
                            disableAreaCodes={true}
                            onlyCountries={this.props.availableSMSCountries}
                            countryCodeEditable={false}
                            autoFormat={true}
                            value={deliverSMSPhoneNumber || ""}
                        /> : null
                    }
                </div>
                <p>{}</p>
                {(this.props.agentUpdateError || this.state.validationError) ?
                    <p className={classes.error}>
                        {this.props.agentUpdateError || this.state.validationError}
                    </p> :
                    null
                }
                <Grid container spacing={5} direction="row">
                    <Grid item>
                        <Button color="secondary" onClick={() => {
                            this.props.showAgent(false)
                        }}>Cancel</Button>
                    </Grid>
                    <Grid item>
                        <AsyncButton loading={this.props.agentUpdateInProgress} color="primary" variant="contained"
                                     onClick={this.handleSave}>Save</AsyncButton>
                    </Grid>
                </Grid>
            </div>
        )
    }
}

AgentSettings.propTypes = {
    showAgent: PropTypes.func
};

const mapStateToProps = (state) => {
    let {agent} = state.agents;
    return {
        agent: agent,
        availableSMSCountries: state.globalSettings.availableSMSCountries,
        agentUpdateError: state.agents.updateError,
        agentUpdateInProgress: state.agents.updateInProgress
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        showAgent: (show, agent) => dispatch(AgentsAction.showAgent(show, agent)),
        updateAgent: (
            agentId,
            extensionNumber,
            deliverSMSPhoneNumber,
            deliverSMS,
            deliverEmail,
            encryptVoicemail,
            transcribeVoicemail) => dispatch(AgentsAction.updateAgent(
            agentId, extensionNumber, deliverSMSPhoneNumber, deliverSMS, deliverEmail,
            encryptVoicemail, transcribeVoicemail
        ))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AgentSettings))
