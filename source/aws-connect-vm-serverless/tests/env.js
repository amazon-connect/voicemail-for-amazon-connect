/**
 * Pre-populates the environment variables for unit tests.
 */
function loadEnvironment() {
    console.log("Loading Environment");
    process.env.AWS_REGION = "us-east-1";
    process.env.TRANSCRIBE_REGION = "us-east-1";
    process.env.STAGE = "prod";
    process.env.AMAZON_CONNECT_INSTANCE_ARN = "arn:aws:connect:us-east-1:xxx:instance/xxx";
    process.env.USERS_TABLE_NAME = `xxx-VoicemailStack-xxx-UsersTable-xxx`;
    /**process.env.CONNECT_USER_STS_ROLE_ARN = "xxx";*/
    process.env.CONTACT_VOICEMAIL_TABLE_NAME = `xxx-VoicemailStack-xxx-ContactVoicemailTable-xxx`;
    process.env.COGNITO_USER_POOL_ID = `us-east-1_xxx`;
    process.env.COGNITO_APP_CLIENT_ID = `UserPoolClient-xxx`;
    process.env.GET_AGENT_BY_EXTENSION_LAMBDA_ARN = `arn:aws:lambda:us-east-1:xxx:function:xxx-VoicemailStack-GetAgentByExtensionLambd-xxx`;
}

export {loadEnvironment}