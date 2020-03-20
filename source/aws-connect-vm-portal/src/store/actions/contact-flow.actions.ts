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

import ContactFlowService from "../../service/contact-flow.service";
import { ApiService } from "../../service/api.service";
import { Dispatch } from "redux";
import ContactFlowDto from "../../dto/contact-flow.dto";
import FileSaverService from "../../service/file-saver.service";

const fileSaverService = new FileSaverService();
const contactFlowService = new ContactFlowService(new ApiService(), fileSaverService);

const ContactFlowActionKey = {
  SHOW_CONTACT_FLOW_MODAL: "SHOW_CONTACT_FLOW_MODAL",
  DOWNLOADING: "DOWNLOADING",
  DOWNLOAD: "DOWNLOAD",
  DOWNLOAD_ERROR: "DOWNLOAD_ERROR"
};

const downloadErrorResults = (error: Error | null) => {
  return {
    type: ContactFlowActionKey.DOWNLOAD_ERROR,
    value: error
  }
};

const downloadingResults = (downloading: Boolean) => {
  return {
    type: ContactFlowActionKey.DOWNLOADING,
    value: downloading
  }
};

const downloadResult = (contactFlow: any) => {
  return {
    type: ContactFlowActionKey.DOWNLOAD,
    value: { contactFlow }
  }
};

const showModalResults = (show: Boolean) => {
  return {
    type: ContactFlowActionKey.SHOW_CONTACT_FLOW_MODAL,
    value: show
  }
};

const ContactFlowAction = {
  download: (contactFloDto: ContactFlowDto) => {
    return (dispatch: Dispatch) => {
      // console.log("The document", document);
      dispatch(downloadErrorResults(null));
      dispatch(downloadingResults(true));
      contactFlowService.downloadContactFlow(contactFloDto)
        .then(contactFlow => {
          dispatch(downloadResult(contactFlow));
        })
        .catch(err => {
          // console.log("The error", err);
          dispatch(downloadErrorResults(err))
        })
        .finally(() => {
          dispatch(downloadingResults(false));
        })
    }
  },
  showModal: (show: Boolean) => {
    return (dispatch: Dispatch) => {
      dispatch(showModalResults(show));
    }
  }
};

export { ContactFlowAction, ContactFlowActionKey }
