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
import {Button, CircularProgress, withStyles} from "@material-ui/core";

const styles = (theme) => ({
    progress: {
        marginLeft: 5,
        verticalAlign: "sub"
    }
});

class AsyncButton extends Component {

    render() {
        let {classes} = this.props;
        const {color, onClick, className, disabled, type} = this.props;
        return(
            <Button type={type || "button"} color={color} onClick={onClick} disabled={(disabled || this.props.loading)} className={className} variant='contained'>
                <span className={classes.span}>{this.props.children} {this.props.loading ? <CircularProgress className={classes.progress} color="secondary" size="1rem"/> : null} </span>
            </Button>
        )
    }

}

AsyncButton.propTypes = {
    loading: PropTypes.bool
};

export default withStyles(styles)(AsyncButton);