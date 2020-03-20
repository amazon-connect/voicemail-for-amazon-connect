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

class ConnectUser {

    constructor(userMap, detail = true) {
        this.userId = userMap["Id"];
        this.arn = userMap["Arn"];
        this.username = userMap["Username"];

        if (!detail) {
            return;
        }

        this.firstName = userMap["IdentityInfo"]["FirstName"];
        this.lastName = userMap["IdentityInfo"]["LastName"];
        this.email = userMap["IdentityInfo"]["Email"];

        if (userMap.hasOwnProperty("PhoneConfig")) {
            this.phoneType = userMap["PhoneConfig"]["PhoneType"];
            this.autoAccept = userMap["PhoneConfig"]["AutoAccept"];
            this.deskPhoneNumber = userMap["PhoneConfig"]["DeskPhoneNumber"];
        } else {
            this.phoneType = null;
            this.autoAccept = null;
            this.deskPhoneNumber = null;
        }

        this.directoryUserId = userMap["DirectoryUserId"];
        this.routingProfileId = userMap["RoutingProfileId"];
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

}

export {ConnectUser};