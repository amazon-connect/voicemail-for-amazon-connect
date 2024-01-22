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

import com.amazonaws.audio.AudioStreamService;
import com.amazonaws.awsconnect.model.ContactTraceRecord;
import com.amazonaws.awsconnect.model.KVStreamRecordingData;
import com.amazonaws.helper.MetricsUtil;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.KinesisEvent;
import com.amazonaws.transcribe.TranscribeService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Base64;
import java.util.List;

public class KVSProcessRecordingLambda implements RequestHandler<KinesisEvent, String> {

    private static final Regions TRANSCRIBE_REGION = Regions.fromName(System.getenv("TRANSCRIBE_REGION"));
    private static final boolean logRecordsFlag = Boolean.parseBoolean(System.getenv("LOG_RECORDS_FLAG"));
    private static final Logger logger = LoggerFactory.getLogger(KVSProcessRecordingLambda.class);
    private static final String TELEPHONIC_SIGNATURES_TABLE = System.getenv("TELEPHONIC_SIGNATURES_TABLE");
    private static final String RECORDINGS_BUCKET_NAME = System.getenv("RECORDINGS_BUCKET_NAME");
    private static final String RECORDINGS_KEY_PREFIX = System.getenv("RECORDINGS_KEY_PREFIX");
    private static final String TEL_SIG_RECORDINGS_BUCKET_NAME = System.getenv("TEL_SIG_RECORDINGS_BUCKET_NAME");
    private static final String TEL_SIG_RECORDINGS_KEY_PREFIX = System.getenv("TEL_SIG_RECORDINGS_KEY_PREFIX");

    @Override
    public String handleRequest(KinesisEvent kinesisEvent, Context context) {
        System.out.println("Processing CTR Event");

        for (KinesisEvent.KinesisEventRecord record : kinesisEvent.getRecords()) {
            try {
                String recordData = new String(record.getKinesis().getData().array());
                System.out.println("Record Data: " + recordData);
                this.processData(recordData);
            } catch (Exception e) {
                // if json does not contain required data, will exit early
                System.out.println(e);
            }
        }

        return "{ \"result\": \"Success\" }";
    }

    private boolean processData(String data) {
        String bucketName = RECORDINGS_BUCKET_NAME;
        String bucketKeyPrefix = RECORDINGS_KEY_PREFIX;
        JSONObject json = new JSONObject(data);
        ContactTraceRecord traceRecord = new ContactTraceRecord(json);
        List<KVStreamRecordingData> recordings = traceRecord.getRecordings();

        if (recordings.size() == 0) {
            return false;
        }

        AmazonDynamoDBClientBuilder builder = AmazonDynamoDBClientBuilder.standard();
        DynamoDB ddbClient = new DynamoDB(builder.build());

        // check if record is telephonic signature
        try {
            Table telephonicSigTable = ddbClient.getTable(TELEPHONIC_SIGNATURES_TABLE);
            Item item = telephonicSigTable.getItem("ContactID", traceRecord.getContactId());
            if (item != null) {
                //configure telephonic signature bucket
                bucketName = TEL_SIG_RECORDINGS_BUCKET_NAME;
                bucketKeyPrefix = TEL_SIG_RECORDINGS_KEY_PREFIX;
                logger.info("Identified telephonic signature record!");
            }
        } catch (Exception e) {
            logger.error("Error occurred while validating if record is telephonic signature: ", e);
        }


        KVStreamRecordingData recording = recordings.get(0);
        // Begin processing audio stream
        TranscribeService transcribeService = new TranscribeService(TRANSCRIBE_REGION);

        ContactVoicemailRepo contactVoicemailRepo = new ContactVoicemailRepo(
                traceRecord.getContactId(),
                traceRecord.getCustomerEndpoint().getAddress(),
                ddbClient,
                logRecordsFlag
        );

        AudioStreamService streamingService = new AudioStreamService(transcribeService, contactVoicemailRepo);
        try {
            streamingService.processAudioStream(
                    recording.getLocation(),
                    recording.getFragmentStartNumber(),
                    traceRecord.getAttributes().getAgentId(),
                    traceRecord.getAttributes().getAgentName(),
                    traceRecord.getContactId(),
                    traceRecord.getAttributes().isTranscribeVoicemail(),
                    traceRecord.getAttributes().isEncryptVoicemail(),
                    traceRecord.getAttributes().getLanguageCode(),
                    traceRecord.getAttributes().getSaveCallRecording(),
                    bucketName,
                    bucketKeyPrefix);
            MetricsUtil.sendMetrics("ProcessVoicemail", "Success", "",
                    traceRecord.getAttributes().isTranscribeVoicemail(),
                    traceRecord.getAttributes().isEncryptVoicemail(),
                    traceRecord.getAttributes().getLanguageCode().orElse(""));
            return true;
        } catch (Exception e) {
            MetricsUtil.sendMetrics("ProcessVoicemail", "Failure", e.getMessage(),
                    traceRecord.getAttributes().isTranscribeVoicemail(),
                    traceRecord.getAttributes().isEncryptVoicemail(),
                    traceRecord.getAttributes().getLanguageCode().orElse(""));
            logger.error("KVS to Transcribe Streaming failed with: ", e);
            return false;
        }

    }

    private String decodeBase64String(String data) {
        String decodedData = new String(Base64.getDecoder().decode(data));
        System.out.println(data);
        this.processData(data);
        return decodedData;
    }
}
