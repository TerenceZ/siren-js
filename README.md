# Siren.js

Siren.js builds upon [koa](https://github.com/koajs/koa) and [Kraken.js](https://github.com/krakenjs/kraken-js) and enables 
environment-aware, dynamic configuration, advanced middleware capabilities, security, and app lifecycle events.

## Basic Usage

```javascript
'use strict';

var siren = require('siren-js');

var app = siren();
app.listen(8000);
```

##NOTE

Unlike [Kraken.js](https://github.com/krakenjs/kraken-js),

- it's __NOT__ recommanded to mount the siren instance. Because it won't emit the life cycle events on the parent app and the middleware won't configure against the parent.

- you should __ONLY__ call `app.callback` or `app.listen` when the app is __READY__ (`start` event is fired) (PS: Of course we can hack on the `app.callback` method to respond 
"server is starting" before ready, but I don't think it is fit for koa).


## API

`siren([options])`

siren-js will return a koa application instance.


### Options
Pass the following options to siren via a config object such as this:

```javascript
var options = {
    onconfig: function *(config) {
        // do stuff
    }
};

// ...

siren(options);
```

#### `basedir` (*String*, optional)

The working directory for siren-js to use. siren-js loads configuration files,
routes, and registers middleware so this directory is the path against all relative paths are resolved. The default value
is the directory of the file that uses siren-js, which is generally `index.js` (or `server.js`).

#### `onconfig` (*Generator Function*, optional)

Provides an asynchronous hook for loading additional configuration. When invoked, a
[confit](https://github.com/krakenjs/confit) configuration object containing all loaded configuration value passed. 
The signature of this handler is `function *(config)` or a function that returns a [yieldable target](https://github.com/tj/co#yieldables).

#### `protocols` (*Object*, optional)

Please refer to [protocols object](https://github.com/krakenjs/kraken-js#protocols-object-optional).

#### `uncaughtException` (*Function*, optional)

Handler for `uncaughtException` errors. See the [endgame](https://github.com/totherik/endgame) module for defaults.


## Config Protocols

Please refer to [config protocols](https://github.com/krakenjs/kraken-js#config-protocols).


## Features


### Configuration

#### Environment-aware

Please refer to [environment-aware](https://github.com/krakenjs/kraken-js#environment-aware).

### Middleware

Much like configuration, you shouldn't need to write a lot of code to determine what's in your middleware chain. [siren-meddleware](https://github.com/TerenceZ/siren-meddleware) is used internally to read,
resolve, and register middleware with your express application. You can either specify the middleware in your config.json or {environment}.json, (or) import it from a separate json file using the import protocol mentioned above.

#### Included Middleware
Siren.js comes with common middleware already included in its `config.json` file. The following is a list of the included middleware and their default configurations which can be overriden in your app's configuration:
* `responseTime` - adds response time to header.
  - Priority - 0
  - Module - `"koa-response-time"` ([npm](https://www.npmjs.com/package/koa-response-time))
* `"shutdown"` - internal middleware which handles graceful shutdowns in production environments
  - Priority - 10
  - Enabled - `true` if *not* in a development environment
  - Module - `"siren-js/middleware/shutdown"`
    - Arguments (*Array*)
      - *String* - the `app` instance placeholder
      - *Object*
        - `"timeout"` - milliseconds (default: `30000`)
        - `"template"` - template to render (default: `null`)
* `"compress"` - adds compression to server responses
  - Priority - 20
  - Enabled - `false` (disabled in all environments by default)
  - Module - `"koa-compress"` ([npm](https://www.npmjs.com/package/koa-compress))
* `"favicon"` - serves the site's favicon
  - Priority - 30
  - Enabled - `false`
  - Module - `"serve-favicon"` ([npm](https://www.npmjs.org/package/koa-favicon))
    - Arguments (*Array*)
      - *String* - local path to the favicon file (default: `"path:./public/favicon.ico"`)
* `"static"` - serves static files from a specific folder
  - Priority - 40
  - Module - `"koa-static"` ([npm](https://www.npmjs.org/package/koa-static))
    - Arguments (*Array*)
      - *String* - local path to serve static files from (default: `"path:./public"`)
* `"logger"` - logs requests and responses
  - Priority - 50
  - Module - `"koa-logger"` ([npm](https://www.npmjs.org/package/koa-logger))
* `"error"` - internal middleware which handles graceful error response
  - Priority - 60
  - Module - `"siren-js/middleware/error"`
    - Arguments (*Array*)
      - *String* - template to render (default: `null`)
* `"body"` - parses request body
  - Priority - 70
  - Module - `"koa-bodyparser"` ([npm](https://www.npmjs.org/package/koa-bodyparser))
    - Arguments (*Array*)
      - *Object*
        - `"extendTypes"` (*Object*) - extended types
* `"session"` - maintains cookie session state
  - Priority - 80
  - Module - `"koa-session"` ([npm](https://www.npmjs.org/package/koa-session))
    - Arguments (*Array*)
      - *String* - the `app` instance placeholder
* `"appsec"` - secures the application against common vulnerabilities
  - Priority - 90
  - Module - `"lusca"` ([github](https://github.com/TerenceZ/siren-lusca))
    - Arguments (*Array*)
      - *Object*
        - `"csrf"` (*Boolean*|*Object*) - value indicating whether to require CSRF tokens for non GET, HEAD, or OPTIONS requests, or an options object to configure CSRF protection (default: `true`)
        - `"xframe"` (*String*) - value for the `X-Frame-Options` header (default: `"SAMEORIGIN"`)
        - `"p3p"` (*String*|*Boolean*) - the Compact Privacy Policy value or `false` if not used (default: `false`)
        - `"csp"` (*Object*|*Boolean*) - options configuring Content Security Policy headers or `false` if not used (default: `false`)
* `"404"` - internal middleware which handles graceful 404 response
  - Priority - 100
  - Module - `"siren-js/middleware/404"`
    - Arguments (*Array*)
      - *String* - template to render (default: `null`)
* `"router"` - routes traffic to the applicable controller
  - Priority - 110
  - Module - `"siren-enrouten"` ([npm](https://www.npmjs.org/package/siren-enrouten))
    - Arguments (*Array*)
      - *String* - the `app` instance placeholder
      - *Object*
        - `"index"` (*String*) - path to the single file to load (default: `"path:./routes"`)


### Lifecycle Events

Siren.js adds support for additional events to your koa app instance:  

* `start` - the application has safely started and is ready to accept requests
* `shutdown` - the application is shutting down, no longer accepting requests
* `stop` - the http server is no longer connected or the shutdown timeout has expired


### Configuration-based `app` Settings
You can configure the koa instance through the `app` field and these field can be access through `app.settings`. For example:
```json
{
    "view engines": {
      // engine map
    },
    "app": {
        "env": "", // NOTE: `env` is managed by the framework. This value will be overwritten.
        "proxy": false,
        "view engine": null,
        "view enabled": true,
        "views": "path:./views",
        "keys": ["siren-secret-key"]
    }
}
```
Additional Note:
- The `app:env`, `app:keys` and `app:proxy` will auto set into the koa instance.
- The `app:view engine`, `view engines` and `app:views` will decorate as
  ```json
  {
    "default": "path:./views", // the value of `app:views`
    "map": { // the value of `view engines`
      
    }
  }
  ```
  and pass into [siren-views](https://github.com/TerenceZ/siren-views) as arguments when `app:view enabled` is not false. 


## Tests
```bash
$ npm test
```

## Coverage
````bash
$ npm run-script test-cov
```
