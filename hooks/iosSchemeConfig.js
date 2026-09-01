const path = require("path");
const fs = require("fs");
const resolveIosConfigPath = require("./resolveIosConfigPath");

// cordova-ios changed the default WKWebView scheme used when config.xml has
// no explicit `scheme` preference from "file" to "app", starting in 8.0.0:
// https://github.com/apache/cordova-ios/pull/1481
const SCHEME_DEFAULT_CHANGE_MAJOR_VERSION = 8;

module.exports = function (context) {
  const opts = context.opts || {};
  const projectRoot = opts.projectRoot;

  if ("string" != typeof projectRoot) {
    console.error("Invalid project root, aborting FullStory plugin");
    return;
  }

  const ConfigParser =
    context.requireCordovaModule("cordova-common").ConfigParser;

  const iosConfigPath = resolveIosConfigPath(context, ConfigParser);
  const iosConfig = new ConfigParser(iosConfigPath);

  if (iosConfig.getPreference("scheme")) {
    console.log("config.xml already specifies an explicit `scheme` preference, skipping.");
    return;
  }

  const cordovaIosPackagePath = path.resolve(
    projectRoot,
    "node_modules",
    "cordova-ios",
    "package.json"
  );

  let cordovaIosVersion;
  try {
    cordovaIosVersion = JSON.parse(
      fs.readFileSync(cordovaIosPackagePath, "utf8")
    ).version;
  } catch (err) {
    console.error(
      `Unable to determine cordova-ios version, aborting FullStory scheme preference fix: ${err}`
    );
    return;
  }

  const majorVersion = parseInt(cordovaIosVersion.split(".")[0], 10);

  if (isNaN(majorVersion)) {
    console.error(
      `Unable to parse cordova-ios version "${cordovaIosVersion}", aborting FullStory scheme preference fix.`
    );
    return;
  }

  const defaultScheme =
    majorVersion >= SCHEME_DEFAULT_CHANGE_MAJOR_VERSION ? "app" : "file";

  iosConfig.setGlobalPreference("scheme", defaultScheme);
  iosConfig.write();

  console.log(
    `No explicit \`scheme\` preference found; set it to "${defaultScheme}" to match cordova-ios@${cordovaIosVersion}'s actual runtime default.`
  );
};
