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

import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;

public class ContactVoicemailRepo {

    private String contactId;
    private String contactPhoneNumber;
    private DynamoDB ddbClient;
    private Boolean logRecordsFlag;
    private static final String CONTACT_VOICEMAIL_TABLE_NAME = System.getenv("CONTACT_VOICEMAIL_TABLE_NAME");
    private static final Logger logger = LoggerFactory.getLogger(ContactVoicemailRepo.class);

    public ContactVoicemailRepo(String contactId, String contactPhoneNumber, DynamoDB ddbClient, Boolean logRecordsFlag) {
        this.contactId = contactId;
        this.contactPhoneNumber = contactPhoneNumber;
        this.ddbClient = ddbClient;
        this.logRecordsFlag = logRecordsFlag;
    }

    public DynamoDB getDdbClient() {
        return ddbClient;
    }

    public void createRecord(
            Long timestamp, String agentId, Boolean shouldTranscribe,
            @Nullable String transcribeStatus, Boolean shouldEncrypt, S3UploadInfo uploadInfo
    ) {
        Item item = new Item()
                .withKeyComponent("contactId", contactId)
                .withLong("timestamp", timestamp)
                .withString("contactPhoneNumber", contactPhoneNumber)
                .withString("assigneeId", agentId)
                .withKeyComponent("readerId", agentId)
                .withBoolean("shouldTranscribe", shouldTranscribe)
                .withBoolean("shouldEncrypt", shouldEncrypt)
                .withString("recordingUrl", uploadInfo.getResourceUrl())
                .withString("recordingBucketName", uploadInfo.getBucketName())
                .withString("recordingObjectKey", uploadInfo.getObjectKey())
                .withString("recordingBucketRegion", uploadInfo.getRegion().getName());

        if (transcribeStatus != null) {
            item.withString("transcribeStatus", transcribeStatus);
        }
        try {
            if (item != null) {
                getDdbClient().getTable(CONTACT_VOICEMAIL_TABLE_NAME).putItem(item);
            }

        } catch (Exception e) {
            logger.error("Exception while writing to DDB: ", e);
        }

        if (logRecordsFlag) {
            logger.info(String.format("Record: %s %d %b %b",
                    contactId,
                    timestamp,
                    shouldTranscribe,
                    shouldEncrypt));
        }
    }

}
