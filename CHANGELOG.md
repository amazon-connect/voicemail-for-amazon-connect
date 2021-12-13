# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## development branch
## [dev_1.0.8] - 2021-12-13
### Changed
- Changes to fix github issue #68 in development branch, where log4j version is vulnerable to security breach
## [dev_1.0.7] - 2021-09-02
### Changed
- Changes to fix github issue#61 in development branch, where the transcriptioniamrole doesnt have secretsmanager:GetValue permissions
- Changed naming convention of CHANGELOG to reflect development branch updates clearly
## [dev_1.0.6] - 2021-08-31
### Changed
- Syncing changes from the master branch v1.0.3
- Bumped java8 to java8.al2 in all the relevant assets
## [dev_1.0.5] - 2021-06-10
### Changed
- Upgrading lambda runtime to nodejs12.x throughout the solution
## [dev_1.0.4] - 2021-05-21
### Changed
- Fixed bug where voicemail is not sent for only sms
## [dev_1.0.3] - 2021-05-20
### Changed
- Add the QueueTypes parm to ListQueues to reduce number of items returned

## [dev_1.0.2] - 2021-03-30
### Changed
- Add a missing environment variable to the TranscriptionEvents Lambda function

## [dev_1.0.1] - 2021-02-22
### Changed
- Add a build output directory to hold the compiled versions of the lambda code

## [dev_1.0.0] - 2021-02-11
### Changed
- Reworked the build system to only use serverless
- Merged in the following PRs:
  - Bump log4j core version (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/23)
  - Remove newline character (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/27)
  - Bump junit version (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/39)
  - Improved error handling of many users (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/52)
  - Use regional domain name for S3 (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/48)

---
## master branch
## [1.0.3] - 2021-07-30
### Changed
- Bumped nodejs10.X to nodejs12.X in all the relevant assets
- Bumped java8 to java8.al2 in all the relevant assets
## [1.0.2] - 2020-07-01
You can deploy at https://solutions-reference.s3.amazonaws.com/voicemail-for-amazon-connect/v1.0.2/voicemail-for-amazon-connect.template
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
- added all code for voicemail-for-amazon-connect
- added unit tests for voicemail-for-amazon-connect

### Changed
- updated build-s3-dist.sh script to include soltion-name parameter
- updated build-open-source.sh script to include soltion-name parameter

### Removed
- deployment/buildspec files.
- helper function

## [0.0.1] - 2019-04-15
### Added
- CHANGELOG templated file
- README templated file
- NOTICE file
- LICENSE file
