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

var co = require("co");
var koa = require("koa");
var path = require("path");
var caller = require("caller");
var bootstrap = require("./lib/bootstrap");
var debug = require("debuglog")("siren");


module.exports = function siren(options) {

  if (typeof options === "string") {
    options = {
      basedir: options
    };
  }

  options = options || {};
  options.protocols = options.protocols || {};
  options.basedir = options.basedir || path.dirname(caller());

  debug("siren options\n", options);

  var app = koa();

  co(function *() {

    yield *bootstrap(app, options);
  }).then(
    app.emit.bind(app, "start"),
    app.emit.bind(app, "error")
  );

  return app;
};