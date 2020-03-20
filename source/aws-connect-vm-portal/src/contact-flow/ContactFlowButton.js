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
import {withStyles} from "@material-ui/core";
import requiresAuth from "../common/requiresAuth";
import {ContactFlowAction} from "../store/actions/contact-flow.actions";

const styles = (theme) => ({
    flowIcon: {
        width: 28,
        "&:hover": {
            cursor: "pointer"
        }
    }
});

class ContactFlowButton extends Component {

    render() {
        let {classes} = this.props;
        return (
            <div>
                <img
                    className={classes.flowIcon}
                    src={process.env.PUBLIC_URL + "images/ContactFlowIcon_2x.png"} alt="Download Contact Flow"
                    onClick={() => {
                        this.props.show(true);
                    }}/>
            </div>
        )
    }

}
const mapStateToProps = (state) => {
    return {
        contactFlow: state.contactFlow.data
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        download: (contactFlowDto) => dispatch(ContactFlowAction.download(contactFlowDto)),
        show: (show) => dispatch(ContactFlowAction.showModal(show))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ContactFlowButton));