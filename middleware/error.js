"use strict";

var statuses = require("statuses");


module.exports = function (template) {

  return function *serverError(next) {

    try {
      yield *next;
      if (this.status === 404 && !this.body) {
        this.throw(404);
      }
    } catch (err) {
      this.status = err.status || 500;

      this.app.emit("error", err, this);

      switch (this.accepts("html", "json")) {
        case "json":
          if ("development" === this.app.env || err.expose) {
            this.body = { error: err.message };
          } else {
            this.body = { error: statuses[this.status] };
          }
          break;

        case "html":
          if (template && typeof this.render === "function") {
            yield *this.render(template, {
              ctx: this,
              code: err.code,
              stack: err.stack,
              env: this.app.env,
              error: err.message,
              status: this.status,
              request: this.request,
              response: this.response,
              statusMessage: statuses[this.status]
            });
          } else {
            if ("development" === this.app.env || err.expose) {
              this.body = "<pre>" + err.message + "</pre>";
            } else {
              this.body = "<pre>" + statuses[this.status] + "</pre>";
            }
            this.type = "text/html";
          }
          break;

        default:
          if ("development" === this.app.env || err.expose) {
            this.body = err.message;
          } else {
            throw err;
          }
      }
    }
  };
};