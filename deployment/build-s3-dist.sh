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
# ./build-s3-dist.sh source-bucket-base-name solution-name version-code
#
# Paramenters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions my-solution v1.0.0
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#
#  - solution-name: name of the solution for consistency
#
#  - version-code: version of the package

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Please provide the base source bucket name, trademark approved solution name and version where the lambda code will eventually reside."
    echo "For example: ./build-s3-dist.sh solutions trademarked-solution-name v1.0.0"
    exit 1
fi

# Get reference for all important folders
template_dir="$PWD"
template_dist_dir="$template_dir/global-s3-assets"
build_dist_dir="$template_dir/regional-s3-assets"
source_dir="$template_dir/../source"

echo "------------------------------------------------------------------------------"
echo "[Init] Clean old dist, node_modules and bower_components folders"
echo "------------------------------------------------------------------------------"
echo "rm -rf $template_dist_dir"
rm -rf $template_dist_dir
echo "mkdir -p $template_dist_dir"
mkdir -p $template_dist_dir
echo "rm -rf $build_dist_dir"
rm -rf $build_dist_dir
echo "mkdir -p $build_dist_dir"
mkdir -p $build_dist_dir

echo "------------------------------------------------------------------------------"
echo "[Rebuild] Example Function"
echo "------------------------------------------------------------------------------"

# Remove temporary build files
cd $source_dir
echo "Removing temp build files under $PWD"
rm -rf .dist
rm -rf node_modules
rm -rf aws-connect-vm-serverless/handler/
rm -rf aws-connect-vm-serverless/target/
rm -rf aws-connect-vm-serverless/.serverless
rm -rf aws-connect-vm-serverless/node_modules
rm aws-connect-vm-serverless/package-lock.json
rm -rf aws-connect-vm-portal/node_modules
rm aws-connect-vm-portal/package-lock.json

echo "source dir: $source_dir"
echo $source_dir
cd $source_dir/aws-connect-vm-serverless
npm install
cd ../aws-connect-vm-portal
npm install --legacy-peer-deps
cd ..
npm install typescript
npm install react-dom
npm install react
npm install redux
npm install react-redux
npm install redux-thunk
#npm install @material-ui/core/styles
bash build.sh build --stage prod --region us-east-1 --bucket %%BUCKET_NAME%%
# Copy packaged Lambda function to $build_dist_dir
mkdir $build_dist_dir/aws-connect-vm-serverless
mkdir $build_dist_dir/aws-connect-vm-portal
cp ./.dist/aws-connect-vm-serverless/* $build_dist_dir/aws-connect-vm-serverless
cp -r ./.dist/aws-connect-vm-portal/build/* $build_dist_dir/aws-connect-vm-portal


echo "------------------------------------------------------------------------------"
echo "[Packing] Templates"
echo "------------------------------------------------------------------------------"
cd $template_dir
echo "cp $template_dir/*.template $template_dist_dir/"
cp $template_dir/*.template $template_dist_dir/
echo "copy yaml templates and rename"
cp $template_dir/*.yaml $template_dist_dir/
cd $template_dist_dir
# Rename all *.yaml to *.template
for f in *.yaml; do 
    mv -- "$f" "${f%.yaml}.template"
done

cd ..
echo "Updating code source bucket in template with $1"
echo "PWD: $PWD"
replace="s/%%BUCKET_NAME%%/$1/g"
echo "sed -i '' -e $replace $template_dist_dir/*.template"
sed -i -e $replace $template_dist_dir/*.template
replace="s/%%SOLUTION_NAME%%/$2/g"
echo "sed -i '' -e $replace $template_dist_dir/*.template"
sed -i -e $replace $template_dist_dir/*.template
replace="s/%%VERSION%%/$3/g"
echo "sed -i '' -e $replace $template_dist_dir/*.template"
sed -i -e $replace $template_dist_dir/*.template
