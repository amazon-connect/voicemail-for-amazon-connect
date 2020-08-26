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
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import {AuthAction} from "../store/actions/auth.actions";
import NavigationBar from "../navigation/NavigationBar";
import {AgentsAction} from "../store/actions/agents.actions";
import AgentsTable from "./AgentsTable";
import {Fade, Dialog, DialogContent, withStyles, Backdrop} from "@material-ui/core";
import GlobalSettings from "../global-settings/GlobalSettings";
import {GlobalSettingsAction} from "../store/actions/global-settings.actions";
import AgentSettings from "./AgentSettings";
import {ContactFlowAction} from "../store/actions/contact-flow.actions";
import ContactFlow from "../contact-flow/ContactFlow";
import requiresAuth from "../common/requiresAuth";
import AgentsNoAuth from './AgentsNoAuth';
import AuthRoles from "../auth/AuthRoles";

const styles = (theme) => ({
    agentsTable: {
        margin: 25
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: "1px solid black"
    },
    noFocus: {
        padding: theme.spacing(2, 4, 3),
        "&:focus": {
            outlineWidth: "0 !important",
            outlineStyle: "none"
        }
    }
});

class Agents extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        let classes = this.props.classes;
        if (this.props.role === "") {
            return (
                <div>
                    <NavigationBar/>
                    <p> The user you logged in with is not in the "Manager" Cognito User Pool group. You must be a member of this group to view this page.</p>
                </div>
            )
        }

        return (
            <div>
                <NavigationBar/>
                <AgentsTable className={classes.agentsTable}/>
                <Dialog
                    scroll="paper"
                    disableAutoFocus={true}
                    open={this.props.showGlobalSettingsModal}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    onClose={() => {
                        this.props.showSettings(false)
                    }}>
                    <Fade in={this.props.showGlobalSettingsModal}>
                        <DialogContent>
                            <GlobalSettings/>
                        </DialogContent>
                    </Fade>
                </Dialog>
                <Dialog
                    scroll="paper"
                    disableAutoFocus={true}
                    open={this.props.showAgentSettings}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    onClose={() => {
                        this.props.showAgentModal(false)
                    }}>
                    <Fade in={this.props.showAgentSettings}>
                        <DialogContent>
                            <AgentSettings/>
                        </DialogContent>
                    </Fade>
                </Dialog>
                <Dialog
                    scroll="paper"
                    disableAutoFocus={true}
                    open={this.props.showContactFlowModal}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    onClose={() => {
                        this.props.showContactFlow(false)
                    }}>
                    <Fade in={this.props.showContactFlowModal}>
                        <DialogContent>
                            <ContactFlow/>
                        </DialogContent>
                    </Fade>
                </Dialog>
            </div>
        )
    }
}

Agents.propTypes = {
    logout: PropTypes.func,
    showGlobalSettingsModal: PropTypes.bool,
};

const mapStateToProps = (state) => {
    let role = "";
    if (state.auth.user) {

        let roles = state.auth.user["roles"];
        if (roles && roles.includes(AuthRoles.MANAGER)) {
            role = "Manager";
        }

        if (roles && roles.includes(AuthRoles.ADMIN)) {
            role = "Administrator"
        }
    }

    return {
        showGlobalSettingsModal: state.globalSettings.showModal,
        agents: state.agents.agents,
        agentsSortKey: state.agents.sortKey,
        agentsSortOrder: state.agents.sortOrder,
        showAgentSettings: state.agents.showAgentSettings,
        agent: state.agents.agent,
        showContactFlowModal: state.contactFlow.showModal,
        contactFlowDownloading: state.contactFlow.downloading,
        role: role
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => dispatch(AuthAction.logout()),
        getAgents: () => dispatch(AgentsAction.getAgents()),
        sortAgents: (sortKey, sortOrder) => dispatch(AgentsAction.sortAgents(sortKey, sortOrder)),
        showSettings: (show) => dispatch(GlobalSettingsAction.showModal(show)),
        showAgentModal: (show, agent) => dispatch(AgentsAction.showAgent(show, agent)),
        showContactFlow: (show) => dispatch(ContactFlowAction.showModal(show)),
        downloadContactFlow: (contactFlowDto) => dispatch(ContactFlowAction.download(contactFlowDto))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(requiresAuth(Agents, AgentsNoAuth)));