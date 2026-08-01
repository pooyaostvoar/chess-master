process.env.NODE_ENV = "test";
process.env.REDIS_URL = process.env.REDIS_URL || "redis://:redis-pass@localhost:6378";

// Pino 10 calls diagnostics_channel.tracingChannel at import time.
// OpenTelemetry (or incomplete shims) can leave this missing under Jest.
const diagnosticsChannel = require("node:diagnostics_channel");

if (typeof diagnosticsChannel.tracingChannel !== "function") {
  diagnosticsChannel.tracingChannel = function tracingChannel() {
    return {
      hasSubscribers: false,
      subscribe: function () {},
      unsubscribe: function () {},
      traceSync: function (fn, _context, thisArg) {
        var args = Array.prototype.slice.call(arguments, 3);
        return fn.apply(thisArg, args);
      },
      tracePromise: function (fn, _context, thisArg) {
        var args = Array.prototype.slice.call(arguments, 3);
        return fn.apply(thisArg, args);
      },
      traceCallback: function (fn, _position, _context, thisArg) {
        var args = Array.prototype.slice.call(arguments, 4);
        return fn.apply(thisArg, args);
      },
    };
  };
}
