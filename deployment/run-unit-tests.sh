#!/bin/bash

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

# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./run-unit-tests.sh
#

# Get reference for all important folders
template_dir="$PWD"
source_dir="$template_dir/../source"

# Run unit tests
echo "Running unit tests"
echo "cd ../source"
cd ../source
echo "No unit tests to run, so sad ..."
echo "Completed unit tests"
