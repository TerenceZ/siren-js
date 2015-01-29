/*!
 * project - module
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var middleware = require("../fixtures/mw");
var qs = require("querystring");
var should = require("should");

describe("lib/socket.io", function () {
  describe("socket", function () {
    it("should get socket ok", function (done) {
      middleware(function* () {
        this.socket.should.be.Object;
        done();
      });
    });

    describe("delegates", function () {
      it("should delegates this.socket ok", function (done) {
        middleware(function* () {

          // properties
          this.nsp.should.equal(this.socket.nsp);
          this.server.should.equal(this.socket.server);
          this.adapter.should.equal(this.socket.adapter);
          this.id.should.equal(this.socket.id);
          this.request.should.equal(this.socket.request);
          this.client.should.equal(this.socket.client);
          this.conn.should.equal(this.socket.conn);
          this.rooms.should.equal(this.socket.rooms);
          this.acks.should.equal(this.socket.acks);
          this.connected.should.equal(this.socket.connected);
          this.disconnected.should.equal(this.socket.disconnected);
          this.handshake.should.equal(this.socket.handshake);

          // flags
          this.json.should.equal(this.socket.json);
          this.volatile.should.equal(this.socket.volatile);
          this.broadcast.should.equal(this.socket.broadcast);

          // methods
          this.emit.should.be.Function;
          this.to.should.be.Function;
          this.in.should.be.Function;
          this.send.should.be.Function;
          this.write.should.be.Function;
          this.join.should.be.Function;
          this.leave.should.be.Function;
          this.disconnect.should.be.Function;
          this.compress.should.be.Function;
          done();
        });
      });
    });
  });

  describe("header", function () {
    it("should return this.socket.request.headers", function (done) {
      middleware(function* () {
        this.header.should.equal(this.socket.request.headers);
        this.header.accept.should.equal("*/*");
        done();
      }).catch(done);
    });
  });

  describe("headers", function () {
    it("should return this.socket.request.headers", function (done) {
      middleware(function* () {
        this.headers.should.equal(this.socket.request.headers);
        this.headers.accept.should.equal("*/*");
        done();
      }).catch(done);
    });
  });

  describe("url", function () {
    it("should return this.socket.request.url", function (done) {
      middleware(function* () {
        this.url.should.equal(this.socket.request.url);
        this.url.should.containEql("/socket.io/");
        done();
      }).catch(done);
    });
  });

  describe("path", function () {
    it("should return this.socket.request.url path", function (done) {
      middleware(function* () {
        this.path.should.equal("/socket.io/");
        done();
      }).catch(done);
    });
  });

  describe("querystring", function () {
    it("should return this.socket.request.url querystring", function (done) {
      middleware(function* () {
        qs.parse(this.querystring).transport.should.equal("polling");
        done();
      }).catch(done);
    });
  });

  describe("query", function () {
    it("should return this.socket.request.url query", function (done) {
      middleware(function* () {
        this.query.transport.should.equal("polling");
        done();
      }).catch(done);
    });
  });

  describe("search", function () {
    it("should return this.socket.request.url search", function (done) {
      middleware(function* () {
        this.search[0].should.equal("?");
        qs.parse(this.search.slice(1)).transport.should.equal("polling");
        done();
      }).catch(done);
    });
  });

  describe("protocol", function () {
    it("should return socket.request's protocol", function (done) {
      middleware(function* () {
        this.protocol.should.equal("http");
        done();
      }).catch(done);
    });
  });

  describe("host", function () {
    it("should return socket.request's host", function (done) {
      middleware(function* () {
        this.host.should.equal(this.server.client.io.uri.replace("http://", ""));
        done();
      }).catch(done);
    });
  });

  describe("hostname", function () {
    it("should return socket.request's hostname", function (done) {
      middleware(function* () {
        this.hostname.should.equal("localhost");
        done();
      }).catch(done);
    });
  });

  describe("secure", function () {
    it("should return socket.request's secure", function (done) {
      middleware(function* () {
        this.secure.should.be.false;
        done();
      }).catch(done);
    });
  });
});