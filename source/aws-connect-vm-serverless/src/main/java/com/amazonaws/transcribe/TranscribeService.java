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

package com.amazonaws.transcribe;


import com.amazonaws.regions.Regions;
import com.amazonaws.services.transcribe.AmazonTranscribe;
import com.amazonaws.services.transcribe.AmazonTranscribeClient;
import com.amazonaws.services.transcribe.model.*;
import org.json.JSONObject;

import java.io.*;
import java.net.*;

public class TranscribeService {

    private AmazonTranscribe transcribe;

    public TranscribeService(Regions region) {
        transcribe = AmazonTranscribeClient.builder()
                .withRegion(region)
                .build();
    }

    public void transcribeMediaUrl(String url, String jobName, String languageCode) {
        StartTranscriptionJobRequest request = new StartTranscriptionJobRequest();
        // https://docs.amazonaws.cn/AWSJavaSDK/latest/javadoc//index.html?com/amazonaws/services/transcribe/AmazonTranscribeClient.html
        request.withLanguageCode(LanguageCode.fromValue(languageCode));
        Media media = new Media();
        media.setMediaFileUri(url);
        request.withMedia(media).withMediaSampleRateHertz(8000);
        request.setTranscriptionJobName(jobName);
        request.withMediaFormat("wav");
        StartTranscriptionJobResult result = transcribe.startTranscriptionJob(request);
    }

    public void getTranscript(String jobName) {
        GetTranscriptionJobRequest request = new GetTranscriptionJobRequest();
        request.setTranscriptionJobName(jobName);
        GetTranscriptionJobResult result = transcribe.getTranscriptionJob(request);
        try {
            String transcriptResult = this.downloadTranscript(result.getTranscriptionJob().getTranscript().getTranscriptFileUri());
            JSONObject json = new JSONObject(transcriptResult);
            String transcript = json.getJSONObject("results").getJSONArray("transcripts").getJSONObject(0).getString("transcript");
        } catch (Exception e) {
            System.out.println("Error getting the transcript");
        }
    }

    private String downloadTranscript(String uri) throws IOException {
        StringBuilder result = new StringBuilder();
        URL url = new URL(uri);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String line;
        while ((line = rd.readLine()) != null) {
            result.append(line);
        }
        rd.close();
        return result.toString();
    }

}
