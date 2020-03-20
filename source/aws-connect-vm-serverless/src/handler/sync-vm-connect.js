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

import 'source-map-support/register'
import {ConnectAgentService} from "../service/connect-agent.service";
import {ConnectService} from "../service/connect.service";
import {UsersRepo} from "../repo/users-repo";
import {Responder} from "../lib/responder";
import {Metrics} from "../lib/metrics";

const agentService = new ConnectAgentService(new ConnectService(), new UsersRepo());

exports.syncHandler = (event, context) => {
  return agentService
      .syncConnectAgents()
      .then(agent => {
        sendMetrics("Success");
      })
      .catch(err => {
        let details = Responder.Error(400, err, "Unable to sync agents", true)
        sendMetrics("Failure", details);
      });
};

exports.syncRequestHandler = (event, context) => {
  return agentService
      .syncConnectAgents()
      .then(agent => {
        sendMetrics("Success");
        return Responder.Response(200, {}, true);
      })
      .catch(err => {
        console.log("returning a 400: " + JSON.stringify(err));
        let details = Responder.Error(400, err, "Unable to sync agents", true)
        sendMetrics("Failure", details);
        return details;
      });
};

function sendMetrics(status, details) {
  Metrics.sendAnonymousData({
    uuid: process.env.UUID,
    process: 'sync',
    status: status,
    details: details || ''
  }).catch(e => console.log(`sendAnonymous: ${e.message}`));
}