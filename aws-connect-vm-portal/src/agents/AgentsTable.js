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
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types'
import {
    Paper, Table, TableHead, TableCell, TableRow, TableBody, TableSortLabel, Grid
} from "@material-ui/core";

import {ArrowDropDown, Check, KeyboardArrowLeft, KeyboardArrowRight} from "@material-ui/icons";
import {AgentsAction, AgentsSortKey, AgentsSortOrder} from "../store/actions/agents.actions";
import AsyncButton from "../common/components/AsyncButton";
import SearchTextField from "../common/SearchTextField";
import {GlobalSettingsAction} from "../store/actions/global-settings.actions";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = (theme) => ({
    '@global': {
        '.MuiTableSortLabel-root': {
            "&:hover": {
                color: "#FFFFFF"
            },
            "&:focus": {
                color: "#FFFFFF"
            }
        },
        ".MuiTableCell-head": {
            fontWeight: 150
        }
    },
    topBar: {
        margin: 15
    },
    search: {
        marginRight: 5
    },
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        minWidth: 650,
    },
    delivery: {
        marginRight: 10
    },
    tableCell: {
        borderRight: "1px solid white"
    },
    clearSearch: {
        width: 15,
        marginBottom: 3,
        marginLeft: -15,
        color: "rgba(0,0,0,0.25)",
        "&:hover": {
            cursor: "pointer"
        },
        zIndex: 1
    },
    checkDisable: {
        color: "#e2e2e2"
    },
    navigationBar: {
        float: "right"
    },
    navButton: {
    },
    syncButton: {
        margin: "0 10px 0 0"
    }
});

const headerCells = [
    {id: 'username', numeric: false, disablePadding: false, label: 'Username', sortable: true},
    {id: 'extension', numeric: false, disablePadding: false, label: 'Extension', sortable: true},
    {id: 'encrypt', numeric: false, disablePadding: false, label: 'Encrypt', sortable: false},
    {id: 'transcribe', numeric: false, disablePadding: false, label: 'Transcribe', sortable: false},
    {id: 'deliveryOptions', numeric: false, disablePadding: false, label: 'Delivery Options', sortable: false}
];

class AgentsTable extends Component {

    constructor(props) {
        super(props);
        this.sortKey = "firstName";
        this.sortOrder = "desc";
        this.searchTextField = null;
        this.state = {
            syncOpen: false
        }
    }

    componentDidMount() {
        this.props.getAgents();
        this.props.fetchGlobalSettings();
    }

    sortBy = (id) => {
        console.log("Should Sort", id);
        let header = headerCells.filter(item => item.id === id)[0];
        if (header.sortable) {
            this.props.sortAgents(id, (this.props.sortOrder === AgentsSortOrder.ASC) ? AgentsSortOrder.DESC : AgentsSortOrder.ASC)
        }
    };

    handleSearchChange = (searchText) => {
        this.props.filterAgents(searchText);
    };

    showAgent = (agent) => {
        this.props.showAgentModal(true, agent);
    };

    handleSync = () => {
        this.setState({syncOpen: false});
        this.props.syncAgents();
    };

    render() {
        let classes = this.props.classes;
        return (
            <div className={this.props.className}>
                <Paper className={classes.root}>
                    <div className={classes.topBar}>
                        <Grid container justify={"space-between"} alignItems={"flex-end"} direction={"row"}>
                            <Grid item className={classes.searchBox}>
                                <SearchTextField
                                    ref={(c) => this.searchTextField = c }
                                    showClearButton={this.props.searchFilter !== ""}
                                    searchChangeFunc={this.handleSearchChange}/>
                            </Grid>
                            <Grid item>
                                <Button color="secondary" className={classes.syncButton} onClick={() => this.setState({syncOpen: true})}>
                                    Sync Agents
                                </Button>
                                <AsyncButton loading={this.props.loading} color={"primary"} onClick={() => {
                                    this.props.getAgents();
                                    if (this.searchTextField) {
                                        this.searchTextField.updateSearch("")
                                    }
                                }} >Refresh</AsyncButton>
                            </Grid>
                        </Grid>
                    </div>
                    <Dialog
                        open={this.state.syncOpen}
                        onClose={() => this.setState({syncOpen: false})}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">Sync Amazon Connect Agents?</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                This process will sync all users in Amazon Connect to the VM portal.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.setState({syncOpen: false})} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={this.handleSync} color="primary" autoFocus>
                                Sync
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Table className={classes.table} stickyHeader aria-label="sticky table" size="small">
                        <TableHead>
                            <TableRow>
                                {headerCells.map(headerCell => (
                                    <TableCell className={classes.tableCell}
                                        key={headerCell.id}
                                        align={headerCell.numeric ? 'right' : 'left'}
                                        padding={headerCell.disablePadding ? 'none' : 'default'}>
                                        <TableSortLabel
                                            onClick={() => this.sortBy(headerCell.id)}
                                            key={headerCell.id}
                                            hideSortIcon={!headerCell.sortable}
                                            active={this.props.sortKey === headerCell.id}
                                            direction={this.props.sortOrder}
                                            IconComponent={ArrowDropDown}>
                                            {headerCell.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.props.agents.map(agent => (
                                <TableRow key={agent.userId} hover onClick={() => {this.showAgent(agent)}}>
                                    <TableCell align="left">{agent.username}</TableCell>
                                    <TableCell align="left">{agent.extension}</TableCell>
                                    <TableCell align="left">{
                                        this.props.encryptVoicemail ?
                                            <Check fontSize="inherit"/> : 
                                                ( agent.encryptVoicemail ? 
                                                    <Check fontSize="inherit"/> : null ) }
                                    </TableCell>
                                    <TableCell align="left">{
                                        agent.transcribeVoicemail ?
                                            <Check className={this.props.transcribeVoicemail ? null : classes.checkDisable} fontSize="inherit"/> :
                                            null}
                                    </TableCell>
                                    <TableCell align="left">
                                        <span
                                            className={classes.delivery}>{agent.deliverEmail ? "Email" : ""}</span>
                                        <span
                                            className={classes.delivery}>{agent.deliverSMS ? `SMS: ${agent.deliverSMSPhoneNumber}` : ""}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className={classes.navigationBar}>
                        <Button disabled={this.props.page.prev.length === 0} onClick={() => {
                            this.props.getAgents(this.props.page.prev[this.props.page.prev.length - 1]);
                        }}><KeyboardArrowLeft className={classes.navButton}/></Button>
                        <Button disabled={this.props.page.next.length === 0} onClick={() => {
                            this.props.getAgents(this.props.page.next[0]);
                        }}><KeyboardArrowRight className={classes.navButton}/></Button>
                    </div>
                </Paper>
            </div>
        )
    }
}

AgentsTable.propTypes = {
    agents: PropTypes.array,
    loading: PropTypes.bool,
    sortKey: PropTypes.string,
    sortOrder: PropTypes.string,
    searchFiler: PropTypes.string,
    getAgents: PropTypes.func,
    sortAgents: PropTypes.func,
    filterAgents: PropTypes.func
};

const mapStateToProps = (state) => {
    return {
        agents: state.agents.agents,
        loading: state.agents.loading,
        sortKey: state.agents.sortKey,
        sortOrder: state.agents.sortOrder,
        searchFilter: state.agents.filter,
        transcribeVoicemail: state.globalSettings.transcribeVoicemail,
        encryptVoicemail: state.globalSettings.encryptVoicemail,
        page: state.agents.page
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getAgents: (next) => dispatch(AgentsAction.getAgents(next)),
        sortAgents: (sortKey, sortOrder) => dispatch(AgentsAction.sortAgents(sortKey, sortOrder)),
        filterAgents: (filter) => dispatch(AgentsAction.filterAgents(filter)),
        showAgentModal: (show, agent) => dispatch(AgentsAction.showAgent(show, agent)),
        fetchGlobalSettings: () => dispatch(GlobalSettingsAction.fetchSettings()),
        syncAgents: () => dispatch(AgentsAction.syncAgents())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AgentsTable));