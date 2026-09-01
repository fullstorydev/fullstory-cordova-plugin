const path = require("path");
const fs = require("fs");

// cordova-ios >=7 always names the platform project folder "App",
// regardless of the app's <name> in config.xml. Older versions used
// the app name as the folder name, so fall back to that for compatibility
// with the plugin's declared "cordova-ios >=6.0.0" engine requirement.
module.exports = function resolveIosConfigPath(context, ConfigParser) {
  const opts = context.opts || {};
  const projectRoot = opts.projectRoot;
  const platformRoot = "platforms/ios";

  const fixedIosConfigPath = path.resolve(
    projectRoot,
    platformRoot,
    "App",
    "config.xml"
  );

  if (fs.existsSync(fixedIosConfigPath)) {
    return fixedIosConfigPath;
  }

  const rootConfigPath = path.resolve(projectRoot, "config.xml");
  const rootConfig = new ConfigParser(rootConfigPath);
  const appName = rootConfig.name();

  return path.resolve(projectRoot, platformRoot, appName, "config.xml");
};
