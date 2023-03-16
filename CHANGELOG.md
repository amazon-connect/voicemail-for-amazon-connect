# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2023-03-16

### Changed
- Modified 'Building distributable for customization' steps in README
- Updated Typescript dependency due to babel__traverse [issue](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/63431)
- Run portal build with legacy [peerDependencies](https://stackoverflow.com/a/66620869/10141884) due to React update

## [1.1.2] - 2023-01-25

### Changed
- Changed colors dev dependency to different fork based on [this](https://fossa.com/blog/npm-packages-colors-faker-corrupted/)

## [1.1.1] - 2022-10-31
### Added
- [Voicemail For Amazon Connect implementation guide pdf](voicemail-for-amazon-connect-implementation-guide.pdf)

### Changed
- Updated links in README

## [1.1.0] - 2022-08-31
### Changed
- Updated all dependencies in `source/aws-connect-vm-serverless/pom.xml`
- Updated `AWS Lambda` runtime to `nodejs16.x` in all templates
    - `deployment/aws-connect-vm.template`
    - `deployment/cloudfront.template`
    - `deployment/copy-artifacts.template`
    - `deployment/voicemail-for-amazon-connect.template`
    - `source/aws-connect-vm-serverless/serverless.yml`
- Updated serverless framework `v1` to `v3`
  - removed `serverless-pseudo-parameters` from plugin and changes pseudo params format
  - added `apiKeys` under `Resources` section of `source/aws-connect-vm-serverless/serverless.yml`
  - Changed all parameter references from `#` (serverless v1) to `$` (serverless v3)
- changed `source/tools/transform.py` to remove conditions not needed for 2 resources due to the `apiKeys` change
- Bumping up dependencies in `source/aws-connect-vm-serverless/package.json` to remove vulnerabilities
- Changes to fix missing value of `SECRET_ARN` from `TranscriptionEvents`, and adding `secretsmanager:GetValue` permissions to `TranscriptionEventsIamRole` in `source/aws-connect-vm-serverless/serverless.yml`
- Fixed bug where voicemail is not sent for only sms in `source/aws-connect-vm-serverless/src/service/notification.service.js`
- Add the `QueueTypes` parm to `ListQueues` to reduce number of items returned in `source/aws-connect-vm-serverless/src/service/contact-flow.service.js`
- Merged in the following PRs:
  - Remove newline character (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/27)
  - Bump junit version (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/39)
  - Improved error handling of many users (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/52)
  - Use regional domain name for S3 (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/48)
## [1.0.5] - 2022-02-09
### Changed
- Bumped `amazon-kinesis-video-streams-parser-library` to `1.2.0`
- Downgraded `request` to `2.53.0`
## [1.0.4] - 2021-12-21
### Changed
- Bumped `amazon-kinesis-video-streams-parser-library` to `1.1.0`
- Bumped `slf4j-api` to `1.7.32`
- Bumped `slf4j-simple` to `1.7.32`
- Bumped `aws-lambda-java-log4j2` to `1.3.0`
- Bumped `log4j-core` to `2.17.0`
- Bumped `log4j-api` to `2.17.0`

## [1.0.3] - 2021-07-30
### Changed
- Bumped nodejs10.X to nodejs12.X in all the relevant assets
- Bumped java8 to java8.al2 in all the relevant assets

## [1.0.2] - 2020-07-01
### Changed
- Fixed bug where customers had to make the email field mutable in the CF template to integrate with SAML.
- Fixed bug where the pre-signed URL expired after 12 hours. Now the pre-signed URL can be valid up to 7 days.
- Made a fix to show an error message instead of a blank page stating that user is not in either group if the user is not assigned it either the Admin or Manager group.
- Fixed bug where there was an undefined variable when there is an exception thrown for too many requests when listing connect users in the sync request.

## [1.0.1] - 2020-03-31
### Changed
- fixed bug where users cannot sync contact flows with over 100 agents

## [1.0.0] - 2020-03-20
### Added
- example-function-js sample microservice
- added unit tests for example-function-js

### Changed
- example.template to yaml file example with JS.
- updated build-s3-dist.sh script to include soltion-name parameter
- updated build-open-source.sh script to include soltion-name parameter
- updated run-unit-tests.sh script to execute example-function-js unit tests

### Removed
- deployment/buildspec files.
- helper function

## [0.0.1] - 2019-04-15
### Added
- CHANGELOG templated file
- README templated file
- NOTICE file
- LICENSE file
