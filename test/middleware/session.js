"use strict";

process.env.NODE_ENV = "_sirendev";

var create = require("../fixtures/app");
var client = require("../fixtures/client");
var request = require("supertest");
var should = require("should");
var path = require("path");
var pedding = require("pedding");


var options = {
  basedir: path.resolve(path.dirname(__dirname), "fixtures", "middleware"),
  onconfig: function *(conf) {
    conf.set("middleware:custom", null);
    conf.set("middleware:custom2", null);
  }
};

describe("session", function() {
	
  describe("when no session", function () {

    it("should emit ok", function (done) {

      create(options).then(function (app) {

        var server = app.listen();
        var socket = client(server);
        done = pedding(done, 2);

        socket.on("connect", done);
        socket.on("error", done);
        socket.on("ok", function () {

          done();
        });
      }).catch(done);
    });

    it("should emit shutdown", function (done) {

      create(options).then(function (app) {

        var server = app.listen();
        var socket = client(server);
        var socket2 = client(server, {
          multiplex: false
        });
        done = pedding(done, 5);

        function tryToClose() {
          done();
          if (socket.__id && socket2.__id) {
            socket.close();
          }
        }

        socket.on("connect", done);
        socket.on("error", done);
        socket.on("ok", function (id) {

          socket.__id = id;
          tryToClose();
        });

        socket2.on("connect", done);
        socket2.on("error", done);
        socket2.on("ok", function (id) {

          socket2.__id = id;
          tryToClose();
        });

        socket2.on("shutdown", function (id) {
          socket.__id.should.equal(id);
          done();
        });
      }).catch(done);
    });

    it("should emit error with forbidden", function (done) {

      create(options).then(function (app) {

        var server = app.listen();
        var socket = client(server, "/user");
        done = pedding(done, 2);
        socket.on("connect", done);
        socket.on("error", function (message) {
          try {
            message.should.equal("forbidden");
            done();
          } catch (e) {
            done(error);
          }
        });
        socket.on("ok", done.bind(null, new Error("should not receive the `ok` message")));
      }).catch(done);
    });
  });

  describe("when with session", function () {

    it("should emit user join", function (done) {

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
              done();
            });
          });
      }).catch(done);
    });

    it("should broadcast msg", function (done) {

      create(options).then(function (app) {

        var server = app.listen();
        request(server)
          .get("/")
          .expect(200)
          .expect("hello", function (err, res) {

            should.not.exist(err);
            var cookie = encodeURIComponent(res.header["set-cookie"].join(";"));
            var socket = client(server, "/user", {query: "cookie=" + cookie});

            done = pedding(done, 5);

            socket.on("connect", done);
            socket.on("error", done);
            socket.on("user join", function (name) {
              name.should.equal("foo");
              done();
            });

            request(server)
              .get("/")
              .expect(200)
              .expect("hello", function (err, res) {

                should.not.exist(err);
                var cookie = encodeURIComponent(res.header["set-cookie"].join(";"));
                var socket2 = client(server, "/user", {query: "cookie=" + cookie, multiplex: false});

                socket2.on("connect", done);
                socket2.on("error", done);
                socket2.on("user join", function (name) {
                  name.should.equal("foo");
                  done();
                });

                socket2.on("msg", function (msg) {
                  msg.should.equal("hello");
                  done();
                });

                socket.emit("msg", "hello");
              });
          });
      }).catch(done);
    });

    it("should emit user leave", function (done) {

      create(options).then(function (app) {

        var server = app.listen();

        request(server)
          .get("/")
          .expect(200)
          .expect("hello", function (err, res) {

            should.not.exist(err);
            var cookie = encodeURIComponent(res.header["set-cookie"].join(";"));
            var socket = client(server, "/user", {query: "cookie=" + cookie});

            done = pedding(done, 3);
            socket.on("connect", done);
            socket.on("error", done);
            socket.on("user join", function (name) {
              name.should.equal("foo");
              done();
              process.nextTick(function () {
                socket.packet({ type: 1 /* parser.DISCONNECT */ });
              });
            });

            socket.on("user leave", function (name) {
              name.should.equal("foo");
              done();
            });
          });
      }).catch(done);
    });
  });
});