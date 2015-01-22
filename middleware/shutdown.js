/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 eBay Software Foundation                                │
 │                                                                             │
 │hh ,'""`.                                                                    │
 │  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
 │  |(@)(@)|  you may not use this file except in compliance with the License. │
 │  )  __  (  You may obtain a copy of the License at                          │
 │ /,'))((`.\                                                                  │
 │(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
 │ `\ `)(' /'                                                                  │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/
"use strict";

var STATES = {
    "CONNECTED": 0,
    "DISCONNECTING": 2
};


module.exports = function shutdown(app, options) {

    var state, server, timeout, template;

    function close() {
        app.emit("shutdown", server, timeout);
    }

    app.once("shutdown", function () {
        state = STATES.DISCONNECTING;
    });

    options = options || {};
    template = options.template;
    timeout = options.timeout || 10 * 1000;
    state = STATES.CONNECTED;

    return function *shutdown(next) {

        if (state === STATES.DISCONNECTING) {
            this.status = 503;
            this.set("Connection", "close");

            switch (this.accepts(["html", "json"])) {
                case "html":
                    if (template && typeof this.render === "function") {
                        yield *this.render(template);
                    } else {
                        this.body = "server is shutting down.";
                        this.type = "text/html";
                    }
                    break;

                case "json":
                    this.body = {
                        message: "server is shutting down."
                    };
                    break;

                default:
                    this.body = "server is shutting down.";
                    this.type = "text/plain";
            }
            return;
        }

        if (!server) {
            server = this.socket.server;
            process.once("SIGTERM", close);
            process.once("SIGINT", close);
        }

        yield *next;
    };
};