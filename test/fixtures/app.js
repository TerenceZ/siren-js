/*!
 * koa.io - test/supports/session_app.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var koa = require("../..");
var co = require("co");

function createMiddleware(fn, nsp) {

  return function* (next) {

    var done = true;

    yield* fn.call(this, _next.call(this));
    function* _next() {

      done = false;
      yield* next;
    }

    if (done) {
      yield* nsp._onconnect.call(this);
    }
  }
}

module.exports = function SessionApp(options) {
  var app = koa(options);

  return co(function *() {

    return yield function (done) {

      app.on("start", function () {

        app.io.sockets.fns.unshift(createMiddleware(function* (next) {
          // we can"t send cookie in ioc
          this.header.cookie = this.query.cookie;
          yield *next;
        }, app.io.sockets));

        app.use(function* () {
          this.session.user = { name: "foo" };
          this.body = "hello";
        });

        app.io.use(function *(next) {

          if (this.session) {
            throw "should not contain session";
          }

          this.emit("ok", this.id);
          yield *next;
          this.broadcast.emit("shutdown", this.id);
        });

        app.io.of("/user").use(function* (next) {

          if (!this.session.user) {
            return this.error("forbidden");
          }
          this.emit("user join", this.session.user.name);
          yield *next;
          this.emit("user leave", this.session.user.name);
        });

        app.io.of("/user").route("msg", function* (next, message) {
          this.broadcast.emit("msg", message);
        });

        done(null, app);
      });

      app.on("error", done);
    };
  });
};