"use strict";

process.env.NODE_ENV = "_sirendev";

var create = require("../fixtures/app");
var client = require("../fixtures/client");
var siren = require("../..");
var request = require("supertest");
var should = require("should");
var path = require("path");
var pedding = require("pedding");

var options = {
  basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
  onconfig: function *(conf) {
    conf.set("middleware:custom", null);
    conf.set("middleware:custom2", null);
    conf.set("middleware:logger:enabled", true);
  }
};

describe("logger", function() {

	it("should not throw error on http request", function (done) {

    var app = siren(options);

    done = pedding(done, 3);

    app.on("middleware:before:logger", function () {

      done();
    });

    app.on("middleware:after:logger", function () {

      done();
    });

    app.on("start", function () {

      request(app.listen())
        .get("/foo")
        .expect(404, done);
    });

    app.on("error", done);
  });

  it("should not throw error on websocket connection", function (done) {

    create(options).then(function (app) {

      var server = app.listen();

      request(server)
        .get("/")
        .expect(200)
        .expect("hello", function (err, res) {

          should.not.exist(err);
          var cookie = encodeURIComponent(res.header["set-cookie"].join(";"));
          var socket = client(server, "/user", {query: "cookie=" + cookie});

          done = pedding(done, 2);
          socket.on("connect", done);
          socket.on("error", done);
          socket.on("user join", function (name) {
            name.should.equal("foo");
            socket.close();
            done();
          });
        });
    }).catch(done);
  });
});