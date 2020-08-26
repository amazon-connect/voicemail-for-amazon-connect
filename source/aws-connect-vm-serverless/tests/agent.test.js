require('./env').loadEnvironment('hdang', 'us-west-2');

import { ConnectAgentService } from "../src/service/connect-agent.service";
import { UsersRepo} from "../src/repo/users-repo";
import { ConnectService } from "../src/service/connect.service";
import { ConnectAgent } from "../src/domain/connect-agent.domain";
import { Agent } from "../src/domain/agent.domain";
import { ConnectUser } from "../src/domain/connect-user.domain";

const agentService = new ConnectAgentService(new ConnectService(), new UsersRepo());


test('Get Agent By Extension', async () => {
    const extension = "1111";
    const userId = "userId";
    const agentResponse = new Agent({
        "userId": "userId",
        "extension": extension,
        "username": "username"
    });
    const connectUserResponse = new ConnectUser({
        "Id": userId,
        "Arn": "arn",
        "Username": "username",
        "IdentityInfo": {
            "FirstName": "first",
            "LastName": "last",
            "Email": "email"
        },
        "DirectoryUserId": "directoryUserId",
        "RoutingProfileId": "routingProfileId"
    });

    const mockGetByExtension = jest.fn();
    UsersRepo.prototype.getAgentByExtension = mockGetByExtension;
    mockGetByExtension.mockReturnValue(Promise.resolve(agentResponse));

    const mockGetConnectUser = jest.fn();
    ConnectService.prototype.getConnectUser = mockGetConnectUser;
    mockGetConnectUser.mockReturnValue(Promise.resolve(connectUserResponse));

    let agent = await agentService.getConnectAgentByExtension(extension);
    console.log("Got agent", agent);
    expect(agent.userId).toBe(userId);
    expect(agent.agent).toBe(agentResponse);
    expect(agent.connectUser).toBe(connectUserResponse);
});

test('Get Agent By Id', async () => {
    const userId = "userId";
    const connectUserResponse = new ConnectUser({
        "Id": userId,
        "Arn": "arn",
        "Username": "username",
        "IdentityInfo": {
            "FirstName": "first",
            "LastName": "last",
            "Email": "email"
        },
        "DirectoryUserId": "directoryUserId",
        "RoutingProfileId": "routingProfileId"
    });
    const agentResponse = new Agent({
        "userId": userId,
        "extension": "1234",
        "username": "username"
    });
    
    const mockGetConnectUser = jest.fn();
    ConnectService.prototype.getConnectUser = mockGetConnectUser;
    mockGetConnectUser.mockReturnValue(Promise.resolve(connectUserResponse));

    const mockGetById = jest.fn();
    UsersRepo.prototype.getAgentByUserId = mockGetById;
    mockGetById.mockReturnValue(Promise.resolve(agentResponse));

    let agent = await agentService.getConnectAgentByUserId(userId);
    console.log("Got agent", agent);
    expect(agent.userId).toBe(userId);
    expect(agent.agent).toBe(agentResponse);
    expect(agent.connectUser).toBe(connectUserResponse);
});

test('Get Agents', async () => {
    const response = {"agents": ["some Id"]};
    const mockGetAgents = jest.fn();

    UsersRepo.prototype.getAgents = mockGetAgents;
    mockGetAgents.mockReturnValue(Promise.resolve(response));

    let agents = await agentService.getConnectAgents(0, 20);
    console.log("Got agents", agents);
    expect(UsersRepo.prototype.getAgents).toHaveBeenCalledWith(0, 20);
});

test('Sync Connect Agents - No Update Needed', async () => {
    const userId = "userId";
    const ddbUsersResponse = [{
        "userId": userId,
        "extension": "1234",
        "username": "username"
    }];
    const connectUsersResponse = [{
        "Id": userId,
        "Arn": "arn",
        "Username": "username",
        "IdentityInfo": {
            "FirstName": "first",
            "LastName": "last",
            "Email": "email"
        },
        "DirectoryUserId": "directoryUserId",
        "RoutingProfileId": "routingProfileId"
    }];

    const mockListUsers = jest.fn();
    ConnectService.prototype.listConnectUsers = mockListUsers;
    mockListUsers.mockReturnValue(Promise.resolve(connectUsersResponse));

    const mockGetAllAgents = jest.fn();
    UsersRepo.prototype.getAllAgents = mockGetAllAgents;
    mockGetAllAgents.mockReturnValue(Promise.resolve(ddbUsersResponse));

    await agentService.syncConnectAgents();
});

test('Sync Connect Agents - DDB Missing Entry', async () => {
    const userId = "userId";
    const ddbUsersResponse = [];
    const connectUsersResponse = [{
        "Id": userId,
        "Arn": "arn",
        "Username": "username",
        "IdentityInfo": {
            "FirstName": "first",
            "LastName": "last",
            "Email": "email"
        },
        "DirectoryUserId": "directoryUserId",
        "RoutingProfileId": "routingProfileId"
    }];

    const mockListUsers = jest.fn();
    ConnectService.prototype.listConnectUsers = mockListUsers;
    mockListUsers.mockReturnValue(Promise.resolve(connectUsersResponse));

    const mockGetAllAgents = jest.fn();
    UsersRepo.prototype.getAllAgents = mockGetAllAgents;
    mockGetAllAgents.mockReturnValue(Promise.resolve(ddbUsersResponse));

    const mockBatchWrite = jest.fn();
    UsersRepo.prototype.batchWrite = mockBatchWrite;
    mockBatchWrite.mockReturnValue(Promise.resolve({}));

    await agentService.syncConnectAgents();
});

test('Update Agent By Id', async () => {
    const userId = "userId";
    const updateInput = {
        "extension": "1234",
        "deliverSMS": "deliverSMS",
        "deliverEmail": "deliverEmail",
        "transcribeVoicemail": true,
        "encryptVoicemail": true
    };
    const connectUserResponse = new ConnectUser({
        "Id": userId,
        "Arn": "arn",
        "Username": "username",
        "IdentityInfo": {
            "FirstName": "first",
            "LastName": "last",
            "Email": "email"
        },
        "DirectoryUserId": "directoryUserId",
        "RoutingProfileId": "routingProfileId"
    });
    const agentResponse = new Agent({
        "userId": userId,
        "extension": "1234",
        "username": "username"
    });

    const mockGetById = jest.fn();
    UsersRepo.prototype.getAgentByUserId = mockGetById;
    mockGetById.mockReturnValue(Promise.resolve(agentResponse));

    const mockUpdateAgentById = jest.fn();
    UsersRepo.prototype.updateAgentById = mockUpdateAgentById;
    mockUpdateAgentById.mockReturnValue(Promise.resolve({}));

    const mockGetConnectUser = jest.fn();
    ConnectService.prototype.getConnectUser = mockGetConnectUser;
    mockGetConnectUser.mockReturnValue(Promise.resolve(connectUserResponse));

    await agentService.updateAgentById(userId, updateInput);
});

test('Update Agent By Id - Create Agent', async () => {
    const userId = "userId";
    const updateInput = {
        "extension": "1234",
        "deliverSMS": "deliverSMS",
        "deliverEmail": "deliverEmail",
        "transcribeVoicemail": true,
        "encryptVoicemail": true
    };
    const connectUserResponse = new ConnectUser({
        "Id": userId,
        "Arn": "arn",
        "Username": "username",
        "IdentityInfo": {
            "FirstName": "first",
            "LastName": "last",
            "Email": "email"
        },
        "DirectoryUserId": "directoryUserId",
        "RoutingProfileId": "routingProfileId"
    });
    const agentResponse = new Agent({
        "userId": userId,
        "extension": "1234",
        "username": "username"
    });

    const mockGetById = jest.fn();
    UsersRepo.prototype.getAgentByUserId = mockGetById;
    mockGetById.mockReturnValue(Promise.resolve(null)).mockReturnValue(Promise.resolve(agentResponse));

    const mockCreateUser = jest.fn();
    UsersRepo.prototype.createAgent = mockCreateUser;
    mockCreateUser.mockReturnValue(Promise.resolve(agentResponse));

    const mockUpdateAgentById = jest.fn();
    UsersRepo.prototype.updateAgentById = mockUpdateAgentById;
    mockUpdateAgentById.mockReturnValue(Promise.resolve({}));

    const mockGetConnectUser = jest.fn();
    ConnectService.prototype.getConnectUser = mockGetConnectUser;
    mockGetConnectUser.mockReturnValue(Promise.resolve(connectUserResponse));

    await agentService.updateAgentById(userId, updateInput);
});