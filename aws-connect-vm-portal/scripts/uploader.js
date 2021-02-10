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

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const cla = require('command-line-args');
const clu = require('command-line-usage');
const colors = require('colors');

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Logger {

    constructor(verbose) {
        this.v = verbose;
    }

    log(message) {
        console.log(`${message}`.blue);
    }

    info(message) {
        console.info(`INFO: ${message}`.blue);
    }

    warn(message) {
        console.warn(`WARN: ${message}`.orange);
    }

    error(message) {
        console.error(`Error: ${message}`.red);
    }

    verbose(message) {
        if (this.v) {
            console.log(`${message}`.gray);
        }
    }
}

class PortalUploader {

    env = null;
    region = null;

    constructor(options) {
        this.options = options;
        this.verbose = options.verbose || false;
        this.logger = new Logger(this.verbose);

        if (!this.options.stage) {
            this.logger.error("Please provide a stage name to continue");
            return;
        }

        this.env = this.loadEnvForStage(this.options.stage);
        this.validateEnv(this.env);
        this.s3 = new AWS.S3({region: this.region});
        this.cloudformation = new AWS.CloudFormation({region: this.region});
        this.cloudfront = new AWS.CloudFront({region: this.region});
    }

    /**
     * Validates the environment object from file
     * @param {Object} env
     */
    validateEnv(env) {
        if (!env.region) {
            this.logger.error("Cannot determine region from the environment file provided");
            return;
        }
        this.region = env.region;
        if (!env.namespace) {
            this.logger.error("Cannot determine namespace from environment file");
            return;
        }
        this.cloudfrontStackName = `${env["namespace"]}-cloudfront`;
        this.logger.verbose(`Environment loaded ${JSON.stringify(this.env)}`);
    }

    /**
     * Loads the env file
     * @param {string} envDirectory Location of the env directory
     * @param {string} stage
     */
    loadEnvForStage(stage, envDirectory = path.resolve(__dirname, '../env')) {
        this.logger.verbose(`Loading environment file for stage ${stage} @ path: ${envDirectory}`);

        let envFiles = fs.readdirSync(envDirectory);
        let stageEnvFile = envFiles.filter((file) => file.startsWith(stage))[0];
        if (!stageEnvFile) throw `Error: Could not find an environment for stage: ${stage}`.red;
        let envFile = path.resolve(__dirname, '../env', stageEnvFile);

        let env = {};
        fs.readFileSync(envFile).toString().replace(/: /g, ":").split("\n").forEach(e => {
            let split = e.split(":");
            env[split[0]] = split[1];
        });
        return env;
    }

    async getCloudFormationStack(stackName, region) {
        let results = await this.cloudformation.describeStacks({
            StackName: stackName
        }).promise();
        let stack = results.Stacks[0];
        let outputs = {};
        stack.Outputs.forEach(output => {
            outputs[output.OutputKey] = output.OutputValue
        });
        this.logger.verbose(stack);
        return {
            stackName,
            outputs
        };
    }

    async createInvalidation(distributionId, itemPaths) {
        let params = {
            DistributionId: distributionId,
            InvalidationBatch: {
                CallerReference: uuid(),
                Paths: {
                    Quantity: itemPaths.length,
                    Items: itemPaths
                }
            }
        };
        this.logger.verbose(JSON.stringify(params, null, 2));
        return this.cloudfront.createInvalidation(params).promise();
    }

    uploadFiles(directory, bucketName) {
        this.logger.verbose(`Uploading files from directory: ${directory} to bucket: ${bucketName}`);
        return Promise.all(this.uploadFile(directory, directory, bucketName).flat(Infinity));

    }

    uploadFile(rootDirectory, directory, bucketName) {
        return fs.readdirSync(directory).map(fileName => {
            let filePath = path.join(directory, fileName);
            let stat = fs.statSync(filePath);
            if (stat.isFile()) {
                let keyPath = filePath.substring(directory.length + 1);
                let keyPrefix = directory.replace(rootDirectory, "");
                if (keyPrefix) {
                    keyPath = `${keyPrefix.slice(1, keyPrefix.length)}/${keyPath}`;
                }
                let params = {
                    Bucket: bucketName,
                    Key: keyPath,
                    Body: fs.readFileSync(filePath),
                    ContentType: this.getContentTypeByFileName(keyPath)
                };

                if (this.options["no-upload"] === true) {
                    return Promise.resolve(params);
                }

                return this.s3.putObject(params).promise()
                    .then(result => {
                        this.logger.verbose(`Uploaded: ... ${bucketName}/${keyPath}`);
                        return result;
                    })
                    .catch(err => {
                        this.logger.error(`Error uploading: ${bucketName}/${keyPath}`)
                    })
            } else if (stat.isDirectory()) {
                return this.uploadFile(rootDirectory, filePath, bucketName);
            }
        })
    }

    getContentTypeByFileName(fileName) {
        let extension = fileName.substr(fileName.lastIndexOf('.') + 1);
        switch (extension) {
            case "html":
                return "text/html";
            case "png":
                return "image/png";
            case "txt":
                return "text/plain";
            case "ico":
                return "image/x-icon";
            case "js":
                return "application/javascript";
            case "json":
                return "application/json";
        }
    }

    async invalidateAndUpload() {
        try {
            let cloudFormation = await this.getCloudFormationStack(this.cloudfrontStackName);
            if (this.options["invalidate"] === true) {
                this.logger.info("Invalidating Cache...");
                await this.createInvalidation(cloudFormation.outputs.DistributionId, ["/*"]);
            }
            let buildDirectory = path.resolve(__dirname, this.options.location);

            if (!cloudFormation.outputs["PortalBucketName"]) {
                this.logger.error("PortalBucketName could not be found in CloudFormation stack");
                return;
            }
            await this.uploadFiles(buildDirectory, cloudFormation.outputs["PortalBucketName"]);
            let domainName = `https:/${cloudFormation.outputs["DistributionDomainName"]}`;
            this.logger.info(`File Upload Completed: ${domainName}`);
        } catch (err) {
            this.logger.error(JSON.stringify(err, null, 2));
        }
    }

}

/**
 * Command line definitions
 * @type {*[]}
 */
const optionDefinitions = [
    {name: 'verbose', alias: 'v', type: Boolean, defaultValue: false},
    {name: 'stage', alias: 's', type: String, defaultValue: null, defaultOption: true},
    {name: 'invalidate', alias: 'i', type: Boolean, defaultValue: false},
    {name: 'location', alias: 'l', type: String, defaultValue: "../build"},
    {name: 'no-upload', alias: 'u', type: Boolean, defaultValue: false},
    {name: 'help', alias: 'h', type: Boolean}
];

/**
 * @property {boolean} verbose
 * @property {boolean} help If true, displays help
 * @type {*}
 */
const options = cla(optionDefinitions);

if (options.help) {
    const usageSections = [
        {
            header: "S3 file uploader for website hosting and Cloudfront Distribution",
            content: "Used to upload files to s3 bucket and invalidate cloudfront cache"
        },
        {
            header: "Options",
            optionList: [
                {name: 'verbose', alias: 'v', typeLabel: '{underline boolean}', description: "Logs extra output"},
                {name: 'stage', alias: 's', typeLabel: '{underline string}', description: "The environment or stage name of your deployment. ie prod-us-west-2.env, prod would be your stage name"},
                {name: 'invalidate', alias: 'i', typeLabel: '{underline boolean}', description: "Whether to invalidate the CloudFront cache before uploading"},
                {name: 'no-upload', alias: 'u', typeLabel: '{underline boolean}', description: "If no-upload is specified, no file uploads will occur"},
                {name: 'location', alias: 'l', typeLabel: '{underline string}', description: "Custom build location.  defaults to ..build"},
                {name: 'help', alias: 'h', typeLabel: '{underline boolean}', description: "Displays the usage guide"}
            ]
        }
    ];
    console.log(clu(usageSections));
    return;
}

const uploader = new PortalUploader(options);
uploader.invalidateAndUpload(false).then();
