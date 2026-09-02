var exec = require("cordova/exec");

var PLUGIN_NAME = "FullStoryPlugin";

var FS = {
  restart: function (success, error) {
    exec(success, error, PLUGIN_NAME, "restart", []);
  },

  shutdown: function (success, error) {
    exec(success, error, PLUGIN_NAME, "shutdown", []);
  },
};

module.exports = FS;
