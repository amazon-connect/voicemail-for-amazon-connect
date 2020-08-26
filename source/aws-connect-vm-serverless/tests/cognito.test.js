require('./env').loadEnvironment('hdang', 'us-west-2');

import {CognitoService} from "../src/service/cognito.service";
const cognitoService = new CognitoService();

const testEmail = 'testEmail';
const tempPassword = 'tempPassword';
const newPassword = 'newPassword';

test('Admin Create User', async () => {
    try {
        const result = await cognitoService.adminCreateUser(
            testEmail,
            'John',
            'Doe',
            'Admin,Manager', true,
            tempPassword
        );
        console.log(result);
    } catch (err) {
        console.log(err);
    }
});

test('Initial Login | Change Password | Refresh', async () => {
    try {
        const result = await cognitoService.signIn(
            testEmail,
            tempPassword
        );
        console.log(result);
    } catch (err) {
        if (err.message === 'NewPasswordRequired') {
            console.log("New Password Required");
            const result = await cognitoService.signIn(
                testEmail,
                tempPassword,
                newPassword
            );
            console.log(result);
            let {idToken, refreshToken, accessToken} = result;
            let refreshResult = await cognitoService.refreshToken(testEmail, idToken, accessToken, refreshToken);
            console.log("Refresh results", refreshResult)
        } else {
            console.log(err);
        }
    }
});