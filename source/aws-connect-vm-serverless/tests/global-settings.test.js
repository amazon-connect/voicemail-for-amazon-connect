require('./env').loadEnvironment('hdang', 'us-west-2');

import {DynamoDBService} from "../src/lib/dynamo";
import {GlobalRepo} from "../src/repo/global-repo";
import {GlobalSettingsService} from "../src/service/global-settings.services";

const globalSettingsService = new GlobalSettingsService(new GlobalRepo());

test('Get Global Settings', async () => {
    const responseItem = {
        "availableSMSCountries": "us,ca"
    };
    const mockGetItem = jest.fn();
    DynamoDBService.prototype.getItem = mockGetItem;
    mockGetItem.mockReturnValue(Promise.resolve(responseItem));

    let settings = await globalSettingsService.getSettings();
    console.log("settings: " + JSON.stringify(settings));
    expect(settings.availableSMSCountries).toBe(responseItem.availableSMSCountries);
});

test('Update Global Settings - Existing', async () => {
    const responseItem = {
        "availableSMSCountries": "us,ca",
        "transcribeVoicemail": "true",
        "encryptVoicemail": "false",
        "deliveryEmail": "testEmail"
    };
    const mockGetItem = jest.fn();
    DynamoDBService.prototype.getItem = mockGetItem;
    mockGetItem.mockReturnValue(Promise.resolve(responseItem));

    const responseUpdate= {
        "Attributes": {
            "availableSMSCountries": "us,ca",
            "transcribeVoicemail": "true",
            "encryptVoicemail": "false",
            "deliveryEmail": "testEmail"
        }
    };
    const mockUpdate = jest.fn();
    DynamoDBService.prototype.update = mockUpdate;
    mockUpdate.mockReturnValue(Promise.resolve(responseUpdate));

    let setting = await globalSettingsService.update(true, false, "testEmail");
    console.log("Existing setting: " + JSON.stringify(setting));
    expect(setting.availableSMSCountries).toBe(responseItem.availableSMSCountries);
});
/*
test('Update Global Settings - Non-existing', async () => {
    const mockGetItem = jest.fn();
    DynamoDBService.prototype.getItem = mockGetItem;
    mockGetItem.mockReturnValue(Promise.resolve(null));
    
    const responsePut = {
        "Attributes": {
            "availableSMSCountries": "us,ca",
            "transcribeVoicemail": "true",
            "encryptVoicemail": "false",
            "deliveryEmail": "testEmail"
        }
    };
    const mockPut = jest.fn();
    DynamoDBService.prototype.put = mockPut;
    mockPut.mockReturnValue(Promise.resolve(responsePut));

    let setting = await globalSettingsService.update(true, false, "testEmail");
    console.log("Update non-existing result" + JSON.stringify(setting));
});*/