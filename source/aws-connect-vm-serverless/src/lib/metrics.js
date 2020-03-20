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

/**
 * @author MediaEnt Solutions
 */

/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */
const HTTPS = require('https');

/**
 * @class Metrics
 * @description send anonymous data to help us to improve the solution
 */
class Metrics {
  static get Constants() {
    return {
      Host: 'metrics.awssolutionsbuilder.com',
      Path: '/generic',
    };
  }

  /**
   * @static
   * @function sendAnonymousData
   * @description send anonymous data to aws solution builder team to help us improve the solution.
   * @param {*} data - JSON data to send anonymously
   * @param {*} env - overwrite payload parameters, used for custom-resource lambda.
   */
  static async sendAnonymousData(data, env) {
    return new Promise((resolve, reject) => {
      const payload = Object.assign({
        Solution: process.env.SOLUTION_ID,
        UUID: process.env.UUID,
        TimeStamp: (new Date()).toISOString().replace('T', ' ').replace('Z', ''),
        Data: data,
      }, env);

      if (!payload.Data || !payload.Solution || !payload.UUID) {
        resolve(undefined);
      }

      const buffers = [];

      const params = {
        hostname: Metrics.Constants.Host,
        port: 443,
        path: Metrics.Constants.Path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const request = HTTPS.request(params, (response) => {
        response.on('data', chunk =>
          buffers.push(chunk));

        response.on('end', () => {
          if (response.statusCode >= 400) {
            reject(new Error(`${response.statusCode} ${response.statusMessage} ${params.hostname}`));
            return;
          }
          resolve(Buffer.concat(buffers));
        });
      });

      request.write(JSON.stringify(payload));

      request.on('error', e =>
        reject(e));

      request.end();
      console.log("successfully sent metrics");
    });
  }
}

module.exports = {
  Metrics,
};