# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## development branch
### Changed
- Reworked the build system to only use serverless
- Merged in the following PRs:
  - Bump log4j core version (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/23)
  - Remove newline character (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/27)
  - Bump junit version (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/39)
  - Improved error handling of many users (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/52)
  - Use regional domain name for S3 (https://github.com/amazon-connect/voicemail-for-amazon-connect/pull/48)

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
