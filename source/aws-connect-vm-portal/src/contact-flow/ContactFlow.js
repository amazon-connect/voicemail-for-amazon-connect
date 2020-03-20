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
    withStyles,
    Grid,
    FormControl,
    InputLabel, Input
} from "@material-ui/core";
import AsyncButton from "../common/components/AsyncButton";
import {ContactFlowAction} from "../store/actions/contact-flow.actions";
import {connect} from "react-redux";
import AuthRoles from "../auth/AuthRoles";

const styles = (theme) => ({
    ...theme.modal,
    root: {
        padding: 0
    }
});

class ContactFlow extends Component {

    constructor(props) {
        super(props);
        this.state = {
            welcomeMessage: "Welcome",
            defaultErrorMessage: "Thank you and have a wonderful day",
            maxVoicemailDuration: 60,
            durationType: "SECOND",
            fallbackQueueName: "BasicQueue",
            errorLoopCount: 3
        }
    }

    handleDownload = () => {
        // console.log("Download");
        let settings = {
            welcomeMessage: this.state.welcomeMessage,
            defaultErrorMessage: this.state.defaultErrorMessage,
            maxVoicemailDuration: this.state.maxVoicemailDuration,
            durationType: "SECOND",
            fallbackQueueName: this.state.fallbackQueueName,
            errorLoopCount: this.state.errorLoopCount
        };
        this.props.download(settings);
    };

    handleInputChange = (event) => {
        event.preventDefault();
        // console.log(event.target);
        // console.log(event.target.id, event.target.name);
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    };

    render() {

        let classes = this.props.classes;

        return(
            <div className={classes.root}>
                <h6 className={classes.title}>Generate Contact Flow</h6>
                <Grid className={classes.inputsContainer} container direction={"column"}>
                    <FormControl>
                        <InputLabel type={"text"} htmlFor="welcome-message">Welcome Message</InputLabel>
                        <Input id="welcome-message" disableUnderline={true} readOnly={false}  name={"welcomeMessage"}  value={this.state.welcomeMessage} onChange={this.handleInputChange}/>
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="fallback-queue-name">Fallback Queue</InputLabel>
                        <Input id="fallback-queue-name" disableUnderline={true} readOnly={false} name={"fallbackQueueName"} value={this.state.fallbackQueueName} onChange={this.handleInputChange}/>
                    </FormControl>
                    <FormControl>
                        <InputLabel type={"text"} htmlFor="default-error-message">Default Error Message</InputLabel>
                        <Input id="default-error-message" disableUnderline={true} readOnly={false}  name={"defaultErrorMessage"}  value={this.state.defaultErrorMessage} onChange={this.handleInputChange}/>
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="max-vm-duration">Max Voicemail Duration (sec.)</InputLabel>
                        <Input type={"number"} inputProps={{ min: "1", max: "120", step: "1" }} id="max-vm-duration" disableUnderline={true} readOnly={false} name={"maxVoicemailDuration"}  value={this.state.maxVoicemailDuration} onChange={this.handleInputChange}/>
                    </FormControl>
                    <FormControl>
                        <InputLabel htmlFor="loop-count">Incorrect Extension Loop Count</InputLabel>
                        <Input type={"number"} inputProps={{ min: "0", max: "10", step: "1" }} id="loop-count" disableUnderline={true} readOnly={false} name={"errorLoopCount"} value={this.state.errorLoopCount} onChange={this.handleInputChange}/>
                    </FormControl>
                </Grid>
                {(this.props.downloadError) ?
                    <p className={classes.error}>
                        {this.props.downloadError}
                    </p> :
                    null
                }
                <Grid className={classes.padTop} container spacing={5} direction="row">
                    <Grid item>
                        <AsyncButton loading={this.props.downloading} color="primary" variant="contained" onClick={this.handleDownload} disabled={this.props.userRole != "Administrator"}>Download</AsyncButton>
                    </Grid>
                </Grid>
            </div>
        )

    }

}

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
        downloading: state.contactFlow.downloading,
        downloadError: state.contactFlow.downloadError,
        userRole: role
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        showModal: (show) => dispatch(ContactFlowAction.showModal(show)),
        download: (contactFlowDto) => dispatch(ContactFlowAction.download(contactFlowDto))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ContactFlow))
