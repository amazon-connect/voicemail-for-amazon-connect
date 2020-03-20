/******************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved. 
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at                                                            
 *                                                                              
 *      http://www.apache.org/licenses/                                        
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.                                              
******************************************************************************/

package com.amazonaws.kvstream;

import com.amazonaws.regions.Regions;

public class S3UploadInfo {

    private String bucketName;
    private String objectKey;
    private Regions region;

    public S3UploadInfo(String bucketName, String objectKey, Regions region) {
        this.bucketName = bucketName;
        this.objectKey = objectKey;
        this.region = region;
    }

    public String getResourceUrl() {
        return String.format("https://s3-%s.amazonaws.com/%s/%s", region.getName(), bucketName, objectKey);
    }

    String getBucketName() {
        return bucketName;
    }

    String getObjectKey() {
        return objectKey;
    }

    Regions getRegion() {
        return region;
    }
}
