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

const FileSaverType = {
    JSON: "application/json",
};

class FileSaverService {

    save(type: string, charset: string = "utf-8", data: string, fileName: string) {
        const a = document.createElement('a');
        a.href = `data:${type};charset=${charset},${data}`;
        a.download = fileName;
        a.click();
        return a;
    }

}

export default FileSaverService;
export {FileSaverType}