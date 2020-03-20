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
import {Cancel, Search} from "@material-ui/icons";
import {Grid, TextField, withStyles} from "@material-ui/core";
import PropTypes from 'prop-types'

const styles = (theme) => ({
    textField: {
        width: 220
    },
    search: {
        marginRight: 5
    },
    clearSearch: {
        width: 18,
        marginBottom: 3,
        marginLeft: -15,
        color: "rgba(0,0,0,0.25)",
        "&:hover": {
            cursor: "pointer"
        },
        zIndex: 1
    }
});

class SearchTextField extends Component {

    constructor(props) {
        super(props);
        this.state = {
            searchValue: ""
        }
    }

    handleSearchChange = (event) => {
        this.updateSearch(event.target.value)
    };

    updateSearch(searchText) {
        this.setState({
            ...this.state,
            searchValue: searchText
        }, () => {
            if (this.props.searchChangeFunc) {
                this.props.searchChangeFunc(this.state.searchValue)
            }
        });
    }

    render() {
        let classes = this.props.classes;
        return (
            <Grid container direction={"row"} alignItems={"flex-end"} alignContent={"center"}>
                <Search className={classes.search}/>
                <Grid item>
                    <TextField
                        className={classes.textField}
                        placeholder={"Search"}
                        name="search"
                        value={this.state.searchValue}
                        onChange={this.handleSearchChange}
                    />
                </Grid>
                {this.props.showClearButton ?
                    <Cancel className={classes.clearSearch} onClick={() => {
                        this.updateSearch("")
                    }}/> :
                    null
                }
            </Grid>
        )
    }

}

SearchTextField.propTypes = {
    searchChangeFunc: PropTypes.func,
    showClearButton: PropTypes.bool
};

export default withStyles(styles)(SearchTextField);