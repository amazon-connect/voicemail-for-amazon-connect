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

package com.amazonaws.awsconnect.model;

import org.json.JSONObject;

public class KVStreamRecordingData {

    private String fragmentStartNumber;
    private String fragmentStopNumber;
    private String location;
    private String startTimestamp;
    private String stopTimestamp;

    public KVStreamRecordingData(JSONObject jsonObject) {
        this.fragmentStartNumber = jsonObject.getString("FragmentStartNumber");
        this.fragmentStopNumber = jsonObject.getString("FragmentStopNumber");
        this.location = jsonObject.getString("Location");
        this.startTimestamp = jsonObject.getString("StartTimestamp");
        this.stopTimestamp = jsonObject.getString("StopTimestamp");
    }

    public String getFragmentStartNumber() {
        return fragmentStartNumber;
    }

    public String getFragmentStopNumber() {
        return fragmentStopNumber;
    }

    public String getLocation() {
        return location;
    }

    public String getStartTimestamp() {
        return startTimestamp;
    }

    public String getStopTimestamp() {
        return stopTimestamp;
    }
}
