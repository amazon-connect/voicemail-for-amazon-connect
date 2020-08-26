/**
 * Pre-populates the environment variables for unit tests.
 */
function loadEnvironment() {
    console.log("Loading Environment");
    process.env.AWS_REGION = "iad";
    process.env.TRANSCRIBE_REGION = "iad";
    process.env.STAGE = "prod";
    process.env.AMAZON_CONNECT_INSTANCE_ARN = "arn:aws:connect:us-west-2:123456789012:instance/aadc335a-9bfd-46c2-b0d1-7fcc365a56b4";
    process.env.USERS_TABLE_NAME = `prod-Users`;
    process.env.CONNECT_USER_STS_ROLE_ARN = "arn:aws:iam::123456789012:role/aws-connect-vm-api-ConnectUserStsRole-Z4YQND6VSXSF";
    process.env.CONTACT_VOICEMAIL_TABLE_NAME = `prod-ContactVoicemail`;
    process.env.COGNITO_USER_POOL_ID = `us-east-1_TlZLQppMm`;
    process.env.COGNITO_APP_CLIENT_ID = `46sv1tgl2v0opb94fdhmd9ffxs`;
    process.env.GET_AGENT_BY_EXTENSION_LAMBDA_ARN = `arn:aws:lambda:iad:123456789012:function:aws-connect-vm-api-iad-get-agent-by-extension`;
}

export {loadEnvironment}