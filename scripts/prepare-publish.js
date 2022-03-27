const fs = require("fs");
const path = require("path");

const nextVersion = process.argv[2];

if (!nextVersion) {
  throw new Error(`Expected version as an argument`);
}

const directoryPath = path.join(__dirname, "../.github/workflows");

fs.readdirSync(directoryPath)
  .filter((f) => f.endsWith(".yml"))
  .forEach(function (ymlFileName) {
    const filePath = path.join(directoryPath, ymlFileName);

    console.log(`${ymlFileName}: searching for out-dated actions version`);

    const existingContent = fs.readFileSync(filePath, "utf8");
    const newContent = existingContent.replace(
      /(pleo-oss\/pleo-spa-cicd\/actions.*@)(.*)/g,
      `$1${nextVersion}`
    );

    if (existingContent !== newContent) {
      console.log(`${ymlFileName}: patching version`);
      fs.writeFileSync(filePath, newContent);
    }
  });
