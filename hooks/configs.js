const path = require("path");
const fs = require("fs");

const rewriteFSGradleSettings = (gradlePath, fsConfig) => {
  const result = fs
    .readFileSync(gradlePath, "utf8")
    .replace(/fs_org/g, fsConfig.org)
    .replace(/fs_version/g, fsConfig.version);

  fs.writeFileSync(gradlePath, result);
  console.log("updated FullStory configurations at " + gradlePath);
};

const rewriteProjectGradleDependencies = (gradlePath, fsConfig) => {
  const dependency = `classpath "com.fullstory:gradle-plugin-local:${fsConfig.version}"`;

  let fileContents = fs.readFileSync(gradlePath, "utf8");
  const regex = /\bclasspath\b.*/g;
  let match = regex.exec(fileContents);

  if (match != null) {
    let insertLocation = match.index + match[0].length;
    fileContents =
      fileContents.substring(0, insertLocation) +
      "\n" +
      dependency +
      fileContents.substring(insertLocation);
    fs.writeFileSync(gradlePath, fileContents, "utf8");
    console.log(
      "updated " + gradlePath + " to include dependency " + dependency
    );
  } else {
    console.error("unable to insert dependency " + dependency);
  }
};

const rewriteProjectGradleRepositories = (gradlePath, repositoriesPath) => {
  if (!fs.existsSync(repositoriesPath)) {
    console.error("File not found: ", repositoriesPath);
    return;
  }

  const repository = 'maven { url "https://maven.fullstory.com" }';

  let gradleFileContents = fs.readFileSync(gradlePath, "utf8");
  let repoFileContents = fs.readFileSync(repositoriesPath, "utf8");

  const repoRegex = /{([\S\s]*)}/g;
  const gradleRegex = /\brepos\b.*/g;

  let gradleMatch = gradleRegex.exec(gradleFileContents);
  let repoMatch = repoFileContents.match(repoRegex);

  if (repoFileContents.match(repoRegex) != null && gradleMatch != null) {
    let repositoriesToWrite = repoMatch[0];
    repositoriesToWrite =
      repositoriesToWrite.slice(0, repositoriesToWrite.length - 1) +
      repository +
      "\n" +
      repositoriesToWrite.slice(repositoriesToWrite.length - 1);

    gradleFileContents = gradleFileContents.replace(
      /repos\b/,
      repositoriesToWrite
    );

    fs.writeFileSync(gradlePath, gradleFileContents, "utf8");
    console.log(
      "updated " + gradlePath + " to include repository " + repository
    );
  } else {
    console.error("unable to insert repository " + repository);
  }
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

  const gradleExtrasPath = path.join(
    projectRoot,
    "plugins",
    "cordova-plugin-fullstory",
    "src/android/plugin.gradle"
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

  const fsConfig = {
    version: config.getPreference("fs_version"),
    org: config.getPreference("fs_org"),
  };

  console.log("FullStory configurations:", fsConfig);

  rewriteFSGradleSettings(gradleExtrasPath, fsConfig);
  rewriteProjectGradleDependencies(projectGradlePath, fsConfig);
  rewriteProjectGradleRepositories(projectGradlePath, projectRepositoriesPath);
  return;
};
