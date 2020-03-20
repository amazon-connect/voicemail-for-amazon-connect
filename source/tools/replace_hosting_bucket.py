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

import argparse


def replace_hosting_bucket(template_path, save_path, hosting_bucket_name):
    with open(template_path, "rt") as file_in:
        with open(save_path, "wt") as file_out:
            for line in file_in:
                file_out.write(line.replace('__HOSTING_BUCKET__', hosting_bucket_name))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--template', help='Template Path')
    parser.add_argument('--save', help='Where to save the modified template')
    parser.add_argument('--bucket', help='Hosting bucket name')
    args = parser.parse_args()
    replace_hosting_bucket(args.template, args.save, args.bucket)
