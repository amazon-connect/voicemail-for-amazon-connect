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

import java.util.Optional;

public class ContactFlowAttributes {

    private String agentId;
    private String agentName;
    private String extensionNumber;
    private String transferMessage;

    private boolean encryptVoicemail;
    private Optional<Boolean> saveCallRecording;
    private boolean transcribeVoicemail;

    private Optional<String> languageCode;

    public ContactFlowAttributes(JSONObject jsonObject) {
        this.agentId = jsonObject.getString("agentId");
        this.agentName = jsonObject.getString("agentName");
        this.extensionNumber = jsonObject.getString("extensionNumber");
        this.transferMessage = jsonObject.getString("transferMessage");
        this.encryptVoicemail = Boolean.parseBoolean(jsonObject.getString("encryptVoicemail"));
        this.saveCallRecording = Optional.of(Boolean.parseBoolean(jsonObject.getString("saveCallRecording")));
        this.transcribeVoicemail = Boolean.parseBoolean(jsonObject.getString("transcribeVoicemail"));
        if (jsonObject.has("languageCode")) {
            this.languageCode = Optional.of(jsonObject.getString("languageCode"));
        } else {
            this.languageCode = Optional.of("en-US");
        }

    }

    public String getAgentId() {
        return agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public String getExtensionNumber() {
        return extensionNumber;
    }

    public String getTransferMessage() {
        return transferMessage;
    }

    public boolean isEncryptVoicemail() {
        return encryptVoicemail;
    }

    public Optional<Boolean> getSaveCallRecording() {
        return saveCallRecording;
    }

    public boolean isSaveCallRecording() {
        return saveCallRecording.orElse(false);
    }

    public boolean isTranscribeVoicemail() {
        return transcribeVoicemail;
    }

    public Optional<String> getLanguageCode() {
        return languageCode;
    }
}
