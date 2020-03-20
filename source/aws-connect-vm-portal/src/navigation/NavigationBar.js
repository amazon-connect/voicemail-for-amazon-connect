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
import {
    AppBar,
    Toolbar,
    IconButton, Grid,
    Typography, withStyles, createMuiTheme
} from "@material-ui/core";

import {ExitToApp} from '@material-ui/icons';
import PropTypes from "prop-types";
import {AuthAction} from "../store/actions/auth.actions";
import GlobalSettingsButton from "../global-settings/GlobalSettingsButton";
import AuthRoles from "../auth/AuthRoles";
import {MuiThemeProvider} from "@material-ui/core";
import themeColors from "../theme/colors";

const styles = (theme) => ({
    root: {
        flexGrow: 1
    },
    logo: {
        margin: "5px 10px 0 0",
        height: 43
    },
    grow: {
        flexGrow: 1
    },
    userInfo: {
        marginRight: 10
    },
    role: {
        fontSize: 12,
        textAlign: "right",
        fontWeight: "bold",
        margin: "4px 0 -2px 0",
        paddingTop: 3
    },
    email: {
        fontSize: 12,
        fontWeight: "light",
        textAlign: "right",
        margin: "-2px 0 0 0",
        padding: 0
    }
});

const theme = new createMuiTheme({
    palette: {
        primary: {
            main: themeColors.navBar
        }
    }
});

class NavigationBar extends Component {

    handleOnLogout = () => {
        this.props.logout();
    };

    render() {
        let {classes} = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <div className={classes.root}>
                    <AppBar position="static">
                        <Toolbar>
                            <Grid container direction="row" justify="space-between" alignContent="center"
                                  alignItems="center">
                                <Grid item>
                                    <Grid container direction="row" alignItems="center" alignContent="center">
                                        <Grid item>
                                            <img alt="Amazon Connect Logo" className={classes.logo}
                                                 src={process.env.PUBLIC_URL + '/images/logo80_2x.png'}/>
                                        </Grid>
                                        <Grid item>
                                            <Typography variant="h5">
                                                Amazon Connect Voicemail Management Portal
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <Grid container direction="row">
                                        <Grid item className={classes.userInfo}>
                                            <Grid container direction="column" alignContent="center"
                                                  alignItems="flex-end">
                                                <Grid item><p className={classes.role}>{this.props.userRole}</p></Grid>
                                                <Grid item><p className={classes.email}>{this.props.userEmail}</p>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item>
                                            <Grid container direction="row" alignItems={"center"}>
                                                <Grid item>
                                                    <GlobalSettingsButton/>
                                                </Grid>
                                                <Grid item>
                                                    <IconButton color="inherit" onClick={this.handleOnLogout}>
                                                        <ExitToApp/>
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                </div>
            </MuiThemeProvider>
        );
    }
}

NavigationBar.propTypes = {
    logout: PropTypes.func
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
        userEmail: state.auth.user["email"],
        userRole: role
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => dispatch(AuthAction.logout()),
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(NavigationBar))