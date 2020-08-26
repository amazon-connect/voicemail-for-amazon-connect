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

// Modifies S3 files for the voicemail portal
// Populates parameters with CloudFormation generated values
// Please see the ReadMe for more context on this file
const AWS = require('aws-sdk');
const replace = require('replace-in-file');


// Fill these values out with the output in CloudWatch logs
const baseApi = "https://vvvvvvvv.execute-api.us-west-2.amazonaws.com/prod";
const apiKey = "7777777";
const cognitoDomain = "vm-some-domain.auth.us-west-2.amazoncognito.com";
const userPoolId = "us-west-2_llllllll";
const clientId = "aaaaaaaaaaaaa";
const redirDomain = "https://dddddddddd.cloudfront.net/login";


function modifyBuildFiles(base_api, api_key, cognito_domain, user_pool_id, client_id, redir_domain) {
  const apigateway = new AWS.APIGateway({
    region: 'us-west-2'
  });

  let agwPromise = new Promise((resolve, reject) => {
    apigateway.getApiKey({
      apiKey: api_key,
      includeValue: true
    }, function (err, data) {
      if (err) console.log(err, err.stack);
      else resolve(data);
    });
  });

  agwPromise.then(function (value) {
    var gwKey = value;
    console.log(`Current directory: ${process.cwd()}`);
    const options = {
      files: [
        'build/static/js/*.js',
        'build/static/js/*.map'
      ],
      from: [/__BASE_API__/g, /__API_KEY__/g, /__C_DOMAIN__/g, /__C_POOL__/g, /__C_CLIENT_ID__/g, /__C_REDIR__/g],
      to: [base_api, gwKey['value'], cognito_domain, user_pool_id, client_id, redir_domain],
    };

    replace(options)
      .then(results => {
        console.log('Replacement results:', results);
      })
      .catch(error => {
        console.error('Error occurred:', error);
      });
  });

};


modifyBuildFiles(baseApi, apiKey, cognitoDomain, userPoolId, clientId, redirDomain);
