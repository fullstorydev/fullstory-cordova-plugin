const path = require("path");
const fs = require("fs");

module.exports = function (context) {
  const opts = context.opts || {};
  const projectRoot = opts.projectRoot;
  const platformRoot = "platforms/ios";

  if ("string" != typeof projectRoot) {
    console.error("Invalid project root, aborting FullStory plugin");
    return;
  }

  const podfilePath = path.resolve(projectRoot, platformRoot, "Podfile");

  let podfileContents = fs.readFileSync(podfilePath, "utf8");

  if (podfileContents.includes("https://ios-releases.fullstory.com")) {
    console.log("Podfile already contains FullStory dependency, skipping.");
    return;
  }

  const ConfigParser =
    context.requireCordovaModule("cordova-common").ConfigParser;
  const rootConfigPath = path.resolve(projectRoot, "config.xml");
  const rootConfig = new ConfigParser(rootConfigPath);
  const appName = rootConfig.name();

  const iosConfigPath = path.resolve(
    projectRoot,
    platformRoot,
    appName,
    "config.xml"
  );

  const iosConfig = new ConfigParser(iosConfigPath);
  const fsVersion = iosConfig.getPreference("fs_version");

  const result = fs
    .readFileSync(podfilePath, "utf8")
    .replace(
      /pod 'FullStory'/g,
      `pod 'FullStory', :http => 'https://ios-releases.fullstory.com/fullstory-${fsVersion}-xcframework.tar.gz'`
    );

  fs.writeFileSync(podfilePath, result);

  console.log("Successfully added FullStory dependency to Podfile.");
  return;
};
