/******************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved. 
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at                                                            
 *                                                                              
 *      http://www.apache.org/licenses/                                        
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.                                              
******************************************************************************/

function processStandardInput(callback) {
    let outputInfo = {};
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', function () {
        let chunk = process.stdin.read();
        if (chunk !== null) {
            let split = chunk.split("\n");
            for (let line of split) {
                let strip = line
                    .replace(" ", "").trim()
                    .replace(" ", "");
                let infoSplit = strip.split(":");
                let infoKey = infoSplit[0];
                let infoValue = infoSplit.slice(1, infoSplit.length).join(":");
                if (infoKey !== "" && infoValue !== "" && !infoKey.includes("http")) {
                    outputInfo[infoKey] = infoValue
                }
            }
        }
    });
    process.stdin.on('end', function () {
        callback(outputInfo)
    });
}

module.exports = processStandardInput;