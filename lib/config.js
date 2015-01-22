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

var path = require("path");
var confit = require("confit");
var handlers = require("shortstop-handlers");
var ssresolve = require("shortstop-resolve");


function createHandlers(options) {
  var result;

  result = {
    file:    handlers.file(options.basedir),
    path:    handlers.path(options.basedir),
    base64:  handlers.base64(),
    env:     handlers.env(),
    require: handlers.require(options.basedir),
    exec:    handlers.exec(options.basedir),
    glob:    handlers.glob(options.basedir),
    options: createOptionsHandler(options)
  };

  Object.keys(options.protocols || {}).forEach(function (protocol) {
    result[protocol] = options.protocols[protocol];
  });

  return result;
}


function createOptionsHandler(options) {

  var rnotation = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[(?:('|")(.+?)\2|(\d+))\])(\(\))?/g;

  return function (path, cb) {

    var current = options;
    var error = "";
    path.replace(rnotation, function (all, name, quote, quotedName, arrayIndex, isFunc) {

      var val;
      if (error) {
        return;
      }

      name = name || quotedName || arrayIndex;
      if (current) {
        if (name in current) {
          val = current[name];
        }

        if (isFunc) {
          if (typeof val !== "function") {
            error = "`" + name + "` is not a function in path `" + path + "`";
            return;
          }
          current = val();
        } else {
          current = val;
        }
        return;
      }

      error = "cannot read property `" + name + "` of undefined in path `" + path + "`";
    });

    cb(error ? new Error(error) : null, current);
  }
}


function createConfig(factory) {

  return function (done) {

    factory.create(function (err, conf) {

      if (err) {
        return done(err);
      }

      done(err, conf);
    });
  };
}


function configPath(prefix) {

  return path.join(prefix, "config");
}


module.exports = function *config(options) {

  var baseProtocols = createHandlers(options);
  baseProtocols.resolve = ssresolve(configPath(path.dirname(__dirname)));

  // Get the global default config.
  var baseConf = yield createConfig(confit({
    basedir: configPath(path.dirname(__dirname)),
    protocols: baseProtocols
  }));

  var appProtocols = createHandlers(options);
  appProtocols.resolve = ssresolve(configPath(options.basedir));

  // Get the user config.
  var appConf = yield createConfig(confit({
    basedir: configPath(options.basedir),
    protocols: appProtocols
  }));

  baseConf.merge(appConf);
  return baseConf;
};