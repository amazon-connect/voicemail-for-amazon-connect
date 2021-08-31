# Voicemail for Amazon Connect
This solution deploys the resources necessary to configure a voicemail system to use with Amazon Connect. Read the [implementation guide](https://aws.amazon.com/solutions/implementations/voicemail-for-amazon-connect/) to see the architecture and get an in depth understanding of the solution.

**Note:**
This GitHub repo has diverged from the AWS Solution linked above in order to facilitate an open source solution that can accept community input. The branch named "master" contains the code that backs the solution deployed from the link above. The "development" branch contains the same solution, but has a simplified build system that removes complexities introduced by the AWS Solution. If you would like to pull down this code to modify it for your own testing, you should use the "development" branch.

## Deployment Steps 
Follow the deployment steps in the [implementation guide](https://aws.amazon.com/solutions/implementations/voicemail-for-amazon-connect/) if you want to deploy the preconfigured solution. If you want to make modifications, follow the below steps to deploy the stack, then continue to follow the solution guide for the post-CloudFormation steps.

### Deploying Code Locally

#### Pre-requisites
To deploy the code locally, you need to do the following:

1. Install and setup the [Java Development Kit](https://www.oracle.com/java/technologies/javase-downloads.html).
2. Install pipenv
3. Install [Maven](http://maven.apache.org/install.html)
4. Install the AWS CLI
5. Create a bucket in S3 that you will upload your code to
6. Create an IAM role that has access to put objects in the bucket and configure the AWS CLI to use that role.

**Note: there is currently a bug with Node v15, so ensure that you have v14.15.4 or older installed until the bug is fixed: [https://github.com/serverless/serverless/issues/8794](https://github.com/serverless/serverless/issues/8794)**

#### Steps

* Create a bucket in S3 that you want to upload this code to
* Replace the bucket and region in the code snippet below then run the following commands
```
cd voicemail-for-amazon-connect
cd aws-connect-vm-serverless
npm install
cd ../aws-connect-vm-portal
npm install
cd ..
pipenv shell
pipenv install
$ sh ./build.sh build --stage prod --region ${BUCKET_REGION} --bucket ${YOUR_BUCKET}
```
* Get the link of the solution main template uploaded to your Amazon S3 bucket. (It will be under aws-connect-vm-serverless/templates/voicemail-for-amazon-connect.template.yaml)
* Deploy the solution to your account by launching a new AWS CloudFormation stack using the link of the solution template in Amazon S3. **Note: This should be in the same region as the Amazon Connect instance you want to use**
* Follow the rest of the deployment steps from the [implementation guide](https://aws.amazon.com/solutions/implementations/voicemail-for-amazon-connect/).

## Solution Updates
If you make any adjustments to this solution for your use case, we would love to pull in the changes so that others can benefit from them too. Please submit a Pull Request with details to what your changes are and we will either add them to the core solution, create a separate branch, or add it to the `solutionVariants` folder depending on the change.

***

This solution collects anonymous operational metrics to help AWS improve the
quality of features of the solution. For more information, including how to disable
this capability, please see the [implementation guide](https://docs.aws.amazon.com/solutions/latest/voicemail-for-amazon-connect/collection-of-operational-metrics.html).

Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://www.apache.org/licenses/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
