# Voicemail for Amazon Connect
> As of January 1st, 2024 this version of the Voicemail for Amazon Connect solution has been archived and is not currently supported. A completely new implementation of Voicemail for Amazon Connect will replace it soon, however the release date has not been finalized yet.
This notice will be updated with any updates and details of the new solution. You can sign up for [release notifications](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications) to automatically get notified of updates.

This solutions deploys the resources necessary to configure a voicemail system to use with Amazon Connect. See [Solution Architecture](https://aws.amazon.com/solutions/implementations/voicemail-for-amazon-connect/).

> Starting in April 2023 Amazon S3 made a change to set the **Bucket Owner Enforced Setting** to be enabled for any newly completed buckets which disables **ACLs**. Since this solution uses Default ACLs, this new default will prevent the CloudFormation stack from deploying. [More Information...](https://aws.amazon.com/blogs/aws/heads-up-amazon-s3-security-changes-are-coming-in-april-of-2023/). 

The master and development branches have been updated to account for the recent S3 changes.  Updated CloudFormation Templates and deployment instructions can be [found here](https://aws-contact-center-blog.s3.us-west-2.amazonaws.com/voicemail-s3-default-acl-issue/vmv1s3fix.zip)

## Development Branch
We have added a new branch to this solution: the "development" branch. The "development" branch contains the same solution, but has a simplified build system that removes complexities introduced by the AWS Solution. If you would like to pull down this code to modify it for your own testing, you should use the "development" branch. The "development" branch is where we will accept PRs and continue to build out the Voicemail solution with more functionality based on feedback from users. We will update the "master" branch with changes from the "development" branch twice a year.

## Running unit tests for customization
* Clone the repository, then make the desired code changes
* Install jest
```
npm install -g jest
```
* Next, run unit tests to make sure added customization passes the tests
```
cd ./source/aws-connect-vm-serverless
npm run test
```

## Building distributable for customization
* Configure the bucket name of your target Amazon S3 distribution bucket
```
export DIST_OUTPUT_BUCKET=my-bucket-name # bucket where customized code will reside
export SOLUTION_NAME=my-solution-name
export VERSION=my-version # version number for the customized code
```
_Note:_ You would have to create an S3 bucket with the name 'my-bucket-name-<aws_region>'; aws_region is where you are testing the customized solution. Also, the assets in bucket should be accessible from the accounts you will run the CloudFormation stack.

* The build script requires Maven and npm; please ensure you have both of these installed in your environment.
* Now build the distributable:
```
cd ./deployment
chmod +x ./build-s3-dist.sh
./build-s3-dist.sh $DIST_OUTPUT_BUCKET $SOLUTION_NAME $VERSION
```

* Deploy the distributable to an Amazon S3 bucket in your account. _Note:_ you must have the AWS Command Line Interface installed.
```
aws s3 cp ./regional-s3-assets  s3://$DIST_OUTPUT_BUCKET-<aws_region>/$SOLUTION_NAME/$VERSION/ --recursive --acl bucket-owner-full-control --profile <aws-cred-profile-name>
aws s3 cp ./global-s3-assets  s3://$DIST_OUTPUT_BUCKET-<aws_region>/$SOLUTION_NAME/$VERSION/ --recursive --acl bucket-owner-full-control --profile <aws-cred-profile-name>
```

* Get the link of the solution template uploaded to your Amazon S3 bucket.
* Deploy the solution to your account by launching a new AWS CloudFormation stack using the link of the solution template in Amazon S3.

*** 

## File Structure

```
|-deployment/
  |-build-s3-dist.sh                        [ shell script for packaging distribution assets ]
  |-run-unit-tests.sh                       [ shell script for executing unit tests ]
  |-voicemail-for-amazon-connect.template   [ solution CloudFormation deployment template ]
|-source/
  |-aws-connect-vm-serverless               [ Backend functions for processing voicemails ]
  |-aws-connect-vm-portal                   [ Voicemail configuration portal ]

```

Each microservice follows the structure of:

```
|-service-name/
  |-lib/
    |-[service module libraries and unit tests]
  |-index.js [injection point for microservice]
  |-package.json
```

***

This solution collects anonymous operational metrics to help AWS improve the
quality of features of the solution. For more information, including how to disable
this capability, please see the [implementation guide](voicemail-for-amazon-connect-implementation-guide.pdf).

Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://www.apache.org/licenses/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
