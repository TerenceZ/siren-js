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

var config = require("./config");
var debug = require("debuglog")("siren/settings");


module.exports = function *settings(app, options) {

  debug("initializing settings");

  var configObject = yield *config(options);

  // Here is a chance to modify the config.
  if (options.onconfig) {
    yield options.onconfig(configObject);
  }

  app.settings = configObject.get("app");
  app.env = configObject.get("env:env");

  // Initialize the socket.io
  var ioConfig = configObject.get("io");
  if (ioConfig && ioConfig.enabled !== false) {
    app._initWebSocket(ioConfig);
    debug("io initialized");
  }

  app.keys = configObject.get("app:keys");
  app.proxy = configObject.get("app:proxy");

  app.siren = configObject;
  app.context.settings = app.settings;

  debug("koa settings\n", app.settings);

  return app;
};