require('./env').loadEnvironment('hdang', 'us-west-2');

import {NotificationService, DeliveryOptionSettings} from "../src/service/notification.service";
import {GlobalSettings} from "../src/domain/global-settings.domain";
import {Agent} from "../src/domain/agent.domain";
import {ContactVoicemail} from "../src/domain/voicemail.domain";
import {ConnectUser} from "../src/domain/connect-user.domain";
import {ConnectAgent} from "../src/domain/connect-agent.domain";
import {S3Service} from "../src/service/s3.service";
import {TranscriptionService} from "../src/service/transcription.service";

const notificationService = new NotificationService(new S3Service(), new TranscriptionService());

test('Get Transcribe and Encrypt Settings', () => {

    // If global settings are false, for transcribe it will always be false. For encrypt, it will depend on per agent settings.
    let globalSettings = new GlobalSettings({
        transcribeVoicemail: false,
        encryptVoicemail: false,
    });

    let voicemail = new ContactVoicemail({
        shouldTranscribe: false,
        shouldEncrypt: false
    });

    let options = notificationService.getTranscribeAndEncryptionSettings(globalSettings, voicemail);
    expect(options.transcribe).toBe(false);
    expect(options.encrypt).toBe(false);



    // If global settings are false, for transcribe it will always be false. For encrypt, it will depend on per agent settings.
    globalSettings = new GlobalSettings({
        transcribeVoicemail: false,
        encryptVoicemail: false,
    });

    voicemail = new ContactVoicemail({
        shouldTranscribe: true,
        shouldEncrypt: true
    });

    options = notificationService.getTranscribeAndEncryptionSettings(globalSettings, voicemail);
    expect(options.transcribe).toBe(false);
    expect(options.encrypt).toBe(true);



    // If global settings are true, for transcribe it will depend on per agent settings. For encrypt, it will always be true.
    globalSettings = new GlobalSettings({
        transcribeVoicemail: true,
        encryptVoicemail: true,
    });

    voicemail = new ContactVoicemail({
        shouldTranscribe: false,
        shouldEncrypt: false
    });

    options = notificationService.getTranscribeAndEncryptionSettings(globalSettings, voicemail);
    expect(options.transcribe).toBe(false);
    expect(options.encrypt).toBe(true);

    // If global settings are true, for transcribe it will depend on per agent settings. For encrypt, it will always be true.
    globalSettings = new GlobalSettings({
        transcribeVoicemail: true,
        encryptVoicemail: true,
    });

    voicemail = new ContactVoicemail({
        shouldTranscribe: true,
        shouldEncrypt: false
    });

    options = notificationService.getTranscribeAndEncryptionSettings(globalSettings, voicemail);
    expect(options.transcribe).toBe(true);
    expect(options.encrypt).toBe(true);

});
/*
test('Get Delivery Content', () => {
    let inputOptions = new DeliveryOptionSettings(false, false);
    let voicemail = new ContactVoicemail({
        shouldTranscribe: false,
        shouldEncrypt: false
    });

    const mockGetFile = jest.fn();
    S3Service.prototype.getItem = mockGetFile;
    mockGetFile.mockReturnValue(Promise.resolve("audioFile"));

    let deliveryContent = notificationService.getDeliveryContents(inputOptions, voicemail);
    console.log("delivery content: " + deliveryContent);
    expect(deliveryContent.transcription).toBe(null);
    expect(deliveryContent.preSignedUrl).toBe(null);
    expect(deliveryContent.audioFile).toBe("audioFile");
});*/