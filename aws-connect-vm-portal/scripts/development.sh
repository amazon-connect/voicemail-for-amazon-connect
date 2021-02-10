###
# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License Version 2.0 (the 'License').
# You may not use this file except in compliance with the License.
# A copy of the License is located at
#
#         http://www.apache.org/licenses/
#
# or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the
# specific language governing permissions and limitations under the License.
#
##

cd ../../../deployment
./build-s3-dist.sh us-east-1.amazon-connect-voicemail-cfn AmazonConnectVoicemail v1.0.0
cd ../source/aws-connect-vm-portal
npm run modify:build
echo "Portal build complete!"
