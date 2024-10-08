const path = require("path");
const fs = require("fs");

const rewriteFSGradleSettings = (gradlePath, fsConfig) => {
  const result = fs
    .readFileSync(gradlePath, "utf8")
    .replace(/fs_org/g, fsConfig.org)
    .replace(/fs_server_url/g, fsConfig.serverUrl)
    .replace(/fs_enabled_variants/g, fsConfig.enabledVariants)
    .replace(/fs_log_level/g, fsConfig.logLevel)
    .replace(/fs_record_on_start/g, fsConfig.recordOnStart);

  fs.writeFileSync(gradlePath, result);
  console.log("Updated FullStory configurations at " + gradlePath);
};

const rewriteProjectGradleDependencies = (gradlePath, fsConfig) => {
  const dependency = `classpath "com.fullstory:gradle-plugin-local:${fsConfig.version}"`;

  let fileContents = fs.readFileSync(gradlePath, "utf8");
  const regex = /\bclasspath\b.*/g;
  let match = regex.exec(fileContents);

  if (match != null) {
    if (fileContents.includes("com.fullstory:gradle-plugin-local")) {
      console.log("Gradle already contains FullStory dependency, skipping.");
      return;
    }
    let insertLocation = match.index + match[0].length;
    fileContents =
      fileContents.substring(0, insertLocation) +
      "\n" +
      dependency +
      fileContents.substring(insertLocation);
    fs.writeFileSync(gradlePath, fileContents, "utf8");
    console.log(
      "Updated " + gradlePath + " to include dependency " + dependency
    );
  } else {
    console.error("Unable to insert dependency " + dependency);
  }
};

const rewriteProjectGradleRepositories = (
  projectRepositoriesPath,
  appRepositoriesPath
) => {
  if (!fs.existsSync(projectRepositoriesPath)) {
    console.error("File not found: ", projectRepositoriesPath);
    return;
  } else if (!fs.existsSync(appRepositoriesPath)) {
    console.error("File not found: ", appRepositoriesPath);
    return;
  }

  const repository = 'maven { url "https://maven.fullstory.com" }';

  let projectRepoFileContents = fs.readFileSync(
    projectRepositoriesPath,
    "utf8"
  );
  let appRepoFileContents = fs.readFileSync(appRepositoriesPath, "utf8");

  const repoRegex = "ext.repos = {.*";

  const projectRepoMatch = new RegExp(repoRegex, "g").exec(
    projectRepoFileContents
  );

  const appRepoMatch = new RegExp(repoRegex, "g").exec(appRepoFileContents);

  // Check if repositories.gradle exists and contains Regex
  if (projectRepoMatch == null || appRepoMatch == null) {
    console.error("Unable to insert respository " + repository);
    return;
  }

  // Check if FS repository already exists in repositories.gradle
  if (
    projectRepoFileContents.match(repository) != null ||
    appRepoFileContents.match(repository) != null
  ) {
    console.error(
      "Unable to insert respository " +
        repository +
        ". You may have already included the maven FullStory repo."
    );
    return;
  }

  const projectRepoInsertLocation =
    projectRepoMatch.index + projectRepoMatch[0].length;
  const appRepoInsertLocation = appRepoMatch.index + appRepoMatch[0].length;

  projectRepoFileContents =
    projectRepoFileContents.substring(0, projectRepoInsertLocation) +
    "\n" +
    repository +
    projectRepoFileContents.substring(projectRepoInsertLocation);

  appRepoFileContents =
    appRepoFileContents.substring(0, appRepoInsertLocation) +
    "\n" +
    repository +
    appRepoFileContents.substring(appRepoInsertLocation);

  fs.writeFileSync(projectRepositoriesPath, projectRepoFileContents, "utf8");
  console.log(
    "Updated " +
      projectRepositoriesPath +
      " to include repository " +
      repository
  );
  fs.writeFileSync(appRepositoriesPath, appRepoFileContents, "utf8");
  console.log(
    "Updated " + appRepositoriesPath + " to include repository " + repository
  );
};

module.exports = function (context) {
  const opts = context.opts || {};
  const projectRoot = opts.projectRoot;
  const platformRoot = "platforms/android";

  if ("string" != typeof projectRoot) {
    console.error("Invalid project root, aborting FullStory plugin");
    return;
  }

  const ConfigParser =
    context.requireCordovaModule("cordova-common").ConfigParser;

  const configPath = path.resolve(
    projectRoot,
    platformRoot,
    "app/src/main/res/xml/config.xml"
  );
  const config = new ConfigParser(configPath);

  // packagename validated by Cordova
  // https://github.com/apache/cordova-android/blob/5eddc460e49a5b8ce2bcc43d0a22fe4511842085/lib/create.js#L216
  const androidPackageName =
    config.android_packageName() || config.packageName();

  // derive project name
  // https://github.com/apache/cordova-android/blob/5eddc460e49a5b8ce2bcc43d0a22fe4511842085/lib/config/CordovaGradleConfigParser.js#L57
  const androidAppName = androidPackageName.substring(
    androidPackageName.lastIndexOf(".") + 1
  );

  const gradleExtrasPath = path.join(
    projectRoot,
    platformRoot,
    "fullstory-cordova-plugin",
    `${androidAppName}-plugin.gradle`
  );

  const projectGradlePath = path.join(
    projectRoot,
    platformRoot,
    "build.gradle"
  );

  const projectRepositoriesPath = path.join(
    projectRoot,
    platformRoot,
    "repositories.gradle"
  );

  const appRepositoriesPath = path.join(
    projectRoot,
    platformRoot,
    "app",
    "repositories.gradle"
  );

  const fsConfig = {
    version: config.getPreference("fs_version"),
    org: config.getPreference("fs_org"),
    serverUrl: config.getPreference("fs_server_url"),
    enabledVariants: config.getPreference("fs_enabled_variants"),
    logLevel: config.getPreference("fs_log_level"),
    recordOnStart: config.getPreference("fs_record_on_start") === "true",
  };

  console.log("FullStory configurations:", fsConfig);

  rewriteFSGradleSettings(gradleExtrasPath, fsConfig);
  rewriteProjectGradleDependencies(projectGradlePath, fsConfig);
  rewriteProjectGradleRepositories(
    projectRepositoriesPath,
    appRepositoriesPath
  );
  return;
};
