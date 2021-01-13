/*
    Copyright 2020 Rustici Software

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
"use strict";

const Hapi = require("@hapi/hapi"),
    H2o2 = require("@hapi/h2o2"),
    Inert = require("@hapi/inert"),
    routes = require("./lib/routes");

const provision = async () => {
    const server = Hapi.server(
            {
                host: process.argv[3],
                port: process.argv[2] || 3399,
                routes: {
                    cors: true,
                    response: {
                        emptyStatusCode: 204
                    }
                }
            }
        ),
        sigHandler = async (signal) => {
            try {
                await server.stop({timeout: 10000});

                console.log(`Catapult CTS service stopped (${signal})`);
                process.exit(0);
            }
            catch (ex) {
                console.log(`Catapult CTS service failed to stop gracefully (${signal}): terminating the process`, ex);
                process.exit(1);
            }
        };

    server.app = {
        player: {
        }
    };

    await server.register(H2o2);
    await server.register(Inert);

    server.route(routes);

    await server.start();

    process.on("SIGINT", sigHandler);
    process.on("SIGTERM", sigHandler);

    console.log("Catapult CTS service running on %s", server.info.uri);
};

process.on(
    "unhandledRejection",
    (err) => {
        console.log(err);
        process.exit(1);
    }
);

provision();