var xcode = require("xcode");
var fs = require("fs");
var path = require("path");

const xcodeProjPath = fromDir("platforms/ios", ".xcodeproj");
const projectPath = xcodeProjPath + "/project.pbxproj";
const myProj = xcode.project(projectPath);

var options = {
  shellPath: "/bin/sh",
  shellScript:
    '"${PODS_ROOT}/FullStory/tools/FullStoryCommandLine" "${CONFIGURATION_BUILD_DIR}/${WRAPPER_NAME}"',
};

myProj.parse(function (err) {
  if (err) {
    console.error(err);
    throw Error(`Adding build phase failed, please contact FullStory support.`);
  }
  myProj.addBuildPhase(
    [],
    "PBXShellScriptBuildPhase",
    "Run FullStory Asset Uploader",
    myProj.getFirstTarget().uuid,
    options
  );
  fs.writeFileSync(projectPath, myProj.writeSync());
});

function fromDir(startPath, filter, rec) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }
  const files = fs.readdirSync(startPath);

  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);

    if (stat.isDirectory() && rec) {
      fromDir(filename, filter);
    }

    if (filename.indexOf(filter) >= 0) {
      return filename;
    }
  }
}
