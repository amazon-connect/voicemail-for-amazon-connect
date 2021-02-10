#******************************************************************************
 #  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved. 
 #  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 #  use this file except in compliance with the License. A copy of the License
 #  is located at                                                            
 #                                                                              
 #      http://www.apache.org/licenses/                                        
 #  or in the 'license' file accompanying this file. This file is distributed on
 #  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 #  implied. See the License for the specific language governing permissions and
 #  limitations under the License.                                              
#******************************************************************************

import boto3
import os
import argparse


'''
These files are to be hosted in an S3 bucket. When users deploy the voicemail-for-amazon-connect.template.yaml file, all the files will be 
copied over their deployment buckets. Bucket MUST exists before running this script
'''
def upload_files(bucket, region, path):
    s3 = boto3.client('s3', region_name=region)

    print("Path for uploading {}".format(path))
    for root, dirs, files in os.walk(path):
        nested_dir = root.replace(path, '')
        if nested_dir:
            nested_dir = nested_dir.replace('/', '', 1) + '/'

        for current_file in files:
            if current_file != ".DS_Store":
                full_path = os.path.join(root, current_file)
                current_file = nested_dir + current_file if nested_dir else current_file
                print("Uploading {} --> {} region: {}".format(current_file, bucket, region))
                s3.upload_file(
                    full_path,
                    bucket,
                    current_file,
                    ExtraArgs={'ContentType': get_content_type_by_name(current_file)}
                )


def get_content_type_by_name(file_name):
    ext = os.path.splitext(file_name)[1]
    if ext == '.html':
        return 'text/html'
    elif ext == '.png':
        return 'image/png'
    elif ext == '.txt':
        return 'text/plain'
    elif ext == '.template':
        return 'application/json'
    elif ext == '.ico':
        return 'image/x-icon'
    elif ext == '.js' or ext == '.map':
        return 'application/javascript'
    elif ext == '.json':
        return 'application/json'
    elif ext == '.yaml':
        return 'text/yaml'
    elif ext == '.jar':
        return 'application/java-archive'
    elif ext == '.zip':
        return 'application/zip'
    else:
        return 'binary/octet-stream'


if __name__ == "__main__":

    parser = argparse.ArgumentParser()
    parser.add_argument('--path', help='Directory to upload')
    parser.add_argument('--bucket', help='Source Hosting Bucket')
    parser.add_argument('--region', help='Source Hosting Region')
    args = parser.parse_args()

    if args.bucket is None:
        raise Exception("Please provide a bucket name")

    # Uploads all teh files in the .dist directory.
    upload_files(args.bucket, args.region, os.path.abspath(args.path))
