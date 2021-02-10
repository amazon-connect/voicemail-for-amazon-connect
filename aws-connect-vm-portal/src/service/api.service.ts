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

import rp from 'request-promise';
import { Auth } from 'aws-amplify';
import { AuthInterface } from "../interface/auth.interface";
import { GlobalSettingsInterface } from "../interface/global-settings.interface";
import { AgentInterface, BasicAgentInterface } from "../interface/agent.interface";
import AgentRequestDto from "../dto/agent-request.dto";
import ContactFlowDto from "../dto/contact-flow.dto";
import AuthDto from "../dto/auth.dto";
import { PageInterface } from "../interface/page.interface";

const HttpMethod = {
  POST: "POST",
  GET: "GET",
  PATCH: "PATCH"
};

class ApiService {

  baseUrl = process.env.REACT_APP_BASE_API;
  apiKey = process.env.REACT_APP_API_KEY;

  getAgents(next: string | null): Promise<PageInterface<BasicAgentInterface>> {
    return this.request(HttpMethod.GET, `${this.baseUrl}/agents`, {
      next
    }, this.getAuth());
  }

  getGlobalSettings() {
    return this.request(HttpMethod.GET, `${this.baseUrl}/global/settings`, null, this.getAuth())
      .then(result => result.settings);
  }

  getContactFlow(contactFlowDto: ContactFlowDto) {
    return this.request(HttpMethod.POST, `${this.baseUrl}/contact/flow`, contactFlowDto, this.getAuth())
      .then(result => result.contactFlow)
  }

  syncAgent() {
    return this.request(HttpMethod.POST, `${this.baseUrl}/agents/sync`, null, this.getAuth());
  }

  updateAgentSettings(agentId: string, agentRequest: AgentRequestDto) {
    return this.request(HttpMethod.POST, `${this.baseUrl}/agents/${agentId}`, agentRequest, this.getAuth())
      .then(result => result.agent)
  }

  getAgent(agentId: string): Promise<AgentInterface> {
    return this.request(HttpMethod.GET, `${this.baseUrl}/agents/${agentId}`, null, this.getAuth())
  }

  saveGlobalSettings(settings: GlobalSettingsInterface) {
    return this.request(HttpMethod.POST, `${this.baseUrl}/global/settings`, settings, this.getAuth())
      .then(result => result.settings);
  }

  _getHeader(auth: AuthInterface | null): object {
    let header: any = {
      'x-api-key': this.apiKey
    };
    if (auth) {
      header['Authorization'] = `Bearer ${auth.idToken}`;
    }
    // console.log("The header", header);
    return header
  }

  getAuth(): Promise<AuthInterface | null> {
    return Auth.currentSession()
      .then(session => new AuthDto({
        idToken: session.getIdToken().getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken()
      }));
  }

  request(method: string, uri: string, body: object | null, auth: Promise<AuthInterface | null> = Promise.resolve(null)): Promise<any> {

    if (method === HttpMethod.POST) {
      return auth.then(auth => this._post(uri, body, auth));
    } else if (method === HttpMethod.GET) {
      return auth.then(auth => this._get(uri, body, auth));
    } else if (method === HttpMethod.PATCH) {
      return auth.then(auth => this._patch(uri, body, auth));
    } else {
      return Promise.resolve();
    }
  }

  _post(uri: string, body: object | null = {}, auth: AuthInterface | null = null) {
    let options = { method: HttpMethod.POST, uri, body, headers: this._getHeader(auth), json: true };
    return rp(options)
  }

  _get(uri: string, qs: object | null, auth: AuthInterface | null = null) {
    let options = { method: HttpMethod.GET, uri, qs, headers: this._getHeader(auth), json: true };
    return rp(options)
  }

  _patch(uri: string, body: object | null = {}, auth: AuthInterface | null = null) {
    let options = { method: HttpMethod.PATCH, uri, body, headers: this._getHeader(auth), json: true };
    return rp(options)
  }

}

export { ApiService };
