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

import ContactFlowDto from "../dto/contact-flow.dto";
import { ApiService } from "./api.service";
import FileSaverService, { FileSaverType } from "./file-saver.service";

class ContactFlowService {

  private apiService: ApiService;
  private fileSaver: FileSaverService;

  constructor(apiService: ApiService, fileSaver: FileSaverService) {
    this.apiService = apiService;
    this.fileSaver = fileSaver;
  }

  downloadContactFlow(contactFlowDto: ContactFlowDto) {
    return this.apiService.getContactFlow(contactFlowDto)
      .then(contactFlow => {
        return this.handleMultipleFlows(contactFlow);
      })
  }

  handleMultipleFlows(flowArr: Array<any>) {
    this.saveAsJson(flowArr[0].metadata.name, flowArr[0]);
    this.saveAsJson(flowArr[1].metadata.name, flowArr[1]);
    return;
  }

  saveAsJson(fileName: string, contactFlow: object) {
    return this.fileSaver.save(FileSaverType.JSON, 'utf-8', encodeURI(JSON.stringify(contactFlow)), fileName);
  }
}

export default ContactFlowService;
