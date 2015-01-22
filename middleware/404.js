"use strict";


module.exports = function (template) {

  return function *fileNotFound(next) {

    yield *next;
    if (this.status !== 404) {
      return;
    }

    this.status = 404;

    switch (this.accepts("html", "json")) {
      case "html":
        if (template && typeof this.render === "function") {
          yield *this.render(template, {
            env: this.app.env,
            ctx: this,
            request: this.request,
            response: this.response
          });
        } else {
          this.body = "Page Not Found";
          this.type = "text/html";
        }
        break;

      case "json":
        this.body = { message: "Page Not Found" };
        break;

      default:
        this.body = "Page Not Found";
        this.type = "text/plain";
    }
  };
};