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

package com.amazonaws.audio;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.kinesisvideo.parser.ebml.InputStreamParserByteSource;
import com.amazonaws.kinesisvideo.parser.mkv.StreamingMkvReader;
import com.amazonaws.kinesisvideo.parser.utilities.FragmentMetadataVisitor;
import com.amazonaws.kvstream.*;
import com.amazonaws.regions.Regions;
import com.amazonaws.transcribe.TranscribeService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;


public class AudioStreamService {

    private static final Regions REGION = Regions.fromName(System.getenv("APP_REGION"));
    private static final String RECORDINGS_BUCKET_NAME = System.getenv("RECORDINGS_BUCKET_NAME");
    private static final String RECORDINGS_KEY_PREFIX = System.getenv("RECORDINGS_KEY_PREFIX");
    private static final boolean RECORDINGS_PUBLIC_READ_ACL = Boolean.parseBoolean(System.getenv("RECORDINGS_PUBLIC_READ_ACL"));
    private static final String START_SELECTOR_TYPE = System.getenv("START_SELECTOR_TYPE");
    private static final Logger logger = LoggerFactory.getLogger(AudioStreamService.class);

    private TranscribeService transcribeService;
    private ContactVoicemailRepo contactVoicemailRepo;

    public AudioStreamService(TranscribeService transcribeService, ContactVoicemailRepo contactVoicemailRepo) {
        this.transcribeService = transcribeService;
        this.contactVoicemailRepo = contactVoicemailRepo;
    }

    public void processAudioStream(
            String streamARN, String startFragmentNum, String agentId, String agentName, String contactId,
            boolean transcribeEnabled, boolean encryptionEnabled, Optional<String> languageCode,
            Optional<Boolean> saveCallRecording) throws Exception {

        logger.info(String.format("StreamARN=%s, startFragmentNum=%s, contactId=%s" +
                "transcribeEnabled=%s, encryptionEnabled=%s", streamARN, startFragmentNum, contactId, transcribeEnabled, encryptionEnabled));

        long unixTime = System.currentTimeMillis() / 1000L;
        Path saveAudioFilePath = Paths.get("/tmp", contactId + "_" + unixTime + ".raw");
        System.out.println(String.format("Save Path: %s Start Selector Type: %s", saveAudioFilePath, START_SELECTOR_TYPE));
        FileOutputStream fileOutputStream = new FileOutputStream(saveAudioFilePath.toString());
        String streamName = streamARN.substring(streamARN.indexOf("/") + 1, streamARN.lastIndexOf("/"));

        InputStream kvsInputStream = KVSUtils.getInputStreamFromKVS(streamName, REGION, startFragmentNum, getAWSCredentials(), START_SELECTOR_TYPE);
        StreamingMkvReader streamingMkvReader = StreamingMkvReader.createDefault(new InputStreamParserByteSource(kvsInputStream));

        FragmentMetadataVisitor.BasicMkvTagProcessor tagProcessor = new FragmentMetadataVisitor.BasicMkvTagProcessor();
        FragmentMetadataVisitor fragmentVisitor = FragmentMetadataVisitor.create(Optional.of(tagProcessor));

        try {
            logger.info("Saving audio bytes to location");

            // Write audio bytes from the KVS stream to the temporary file
            ByteBuffer audioBuffer = KVSUtils.getByteBufferFromStream(streamingMkvReader, fragmentVisitor, tagProcessor, contactId);
            while (audioBuffer.remaining() > 0) {
                byte[] audioBytes = new byte[audioBuffer.remaining()];
                audioBuffer.get(audioBytes);
                fileOutputStream.write(audioBytes);
                audioBuffer = KVSUtils.getByteBufferFromStream(streamingMkvReader, fragmentVisitor, tagProcessor, contactId);
            }

        } finally {
            logger.info(String.format("Closing file and upload raw audio for contactId: %s ... %s Save Call Recording: %b", contactId, saveAudioFilePath, saveCallRecording));
            closeFileAndUploadRawAudio(
                    kvsInputStream, fileOutputStream, saveAudioFilePath, agentId, contactId,
                    unixTime, saveCallRecording, transcribeEnabled, encryptionEnabled, languageCode.get()
            );
        }
    }

    /**
     * Closes the FileOutputStream and uploads the Raw audio file to S3
     *
     * @param kvsInputStream
     * @param fileOutputStream
     * @param saveAudioFilePath
     * @param saveCallRecording should the call recording be uploaded to S3?
     * @throws IOException
     */
    private void closeFileAndUploadRawAudio(InputStream kvsInputStream, FileOutputStream fileOutputStream,
                                            Path saveAudioFilePath, String agentId, String contactId,
                                            long unixTime, Optional<Boolean> saveCallRecording, boolean transcribeEnabled,
                                            boolean encryptionEnabled, String languageCode) throws IOException {

        kvsInputStream.close();
        fileOutputStream.close();

        logger.info(String.format("Save call recording: %b", saveCallRecording));
        logger.info(String.format("File size: %d", new File(saveAudioFilePath.toString()).length()));

        // Upload the Raw Audio file to S3
        if ((saveCallRecording.orElse(false)) && (new File(saveAudioFilePath.toString()).length() > 0)) {
            S3UploadInfo uploadInfo = AudioUtils.uploadRawAudio(REGION, RECORDINGS_BUCKET_NAME, RECORDINGS_KEY_PREFIX,
                    saveAudioFilePath.toString(), agentId, contactId, RECORDINGS_PUBLIC_READ_ACL, getAWSCredentials());

            String transcriptJobName = contactId + "_" + unixTime;

            if (transcribeEnabled) {
                contactVoicemailRepo.createRecord(unixTime, agentId, true, "IN_PROGRESS", encryptionEnabled, uploadInfo);
                transcribeService.transcribeMediaUrl(uploadInfo.getResourceUrl(), transcriptJobName, languageCode);
            } else {
                contactVoicemailRepo.createRecord(unixTime, agentId, false, null, encryptionEnabled, uploadInfo);
            }
        } else {
            logger.info("Skipping upload to S3.  saveCallRecording was disabled or audio file has 0 bytes: " + saveAudioFilePath);
        }
    }

    /**
     * @return AWS credentials to be used to connect to s3 (for fetching and uploading audio) and KVS
     */
    private static AWSCredentialsProvider getAWSCredentials() {
        return DefaultAWSCredentialsProviderChain.getInstance();
    }


}
