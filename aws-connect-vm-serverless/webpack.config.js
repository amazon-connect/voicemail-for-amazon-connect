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

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const entries = require('./tools/lambda-entries');

module.exports = {
    devtool: 'source-map',
    entry: entries(path.join(__dirname + "/src/handler")),
    output: {
        libraryTarget: 'commonjs',
        filename: "[name].js",
        path: __dirname + "/handler"
    },
    mode: "production",
    target: 'node',
    optimization: {
        minimize: true
    },
    performance: {
        hints: false
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                include: [
                    /node_modules/
                ],
                use: [{
                    loader: 'babel-loader'
                }]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json'],
        modules: [
            path.resolve(__dirname), 'node_modules'
        ]
    }
};
