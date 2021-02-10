/******************************************************************************
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *                                                                                                                   *
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not
 *  use this file except in compliance with the License. A copy of the License
 *  is located at                                                            
 *                                                                                                                   
 *      http://www.apache.org/licenses/                                                                                   *                                                                                                                  
 *  or in the 'license' file accompanying this file. This file is distributed on
 *  an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.                                                                                
******************************************************************************/

class ContactFlowDto {

    welcomeMessage: string;
    defaultErrorMessage: string;
    maxVoicemailDuration: number;
    durationType: string;
    fallbackQueueName: string;
    errorLoopCount: number;

    constructor(
        welcomeMessage: string,
        defaultErrorMessage: string,
        maxVoicemailDuration: number,
        durationType: string,
        fallbackQueueName: string,
        errorLoopCount: number
    ) {
        this.welcomeMessage = welcomeMessage;
        this.defaultErrorMessage = defaultErrorMessage;
        this.maxVoicemailDuration = maxVoicemailDuration;
        this.durationType = durationType;
        this.fallbackQueueName = fallbackQueueName;
        this.errorLoopCount = errorLoopCount;
    }

    static defaultContactFlow(): ContactFlowDto {
        return new ContactFlowDto(
            "Welcome",
            "Thank you, and have a wonderful day.",
            60,
            "SECOND",
            "BasicQueue",
            2
        )
    }

}

export default ContactFlowDto;