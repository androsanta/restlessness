const { exec, execSync } = require("child_process");
const path = require('path');

// Arguments will specify which version to increment
const validArgs = ['--major', '--minor', '--patch']
// with patch being the default
let arg = validArgs[2]

if (process.argv.length === 2) {
  console.log('No argument specified, incrementing patch version by default')
} else if (process.argv.length === 3) {
  if (validArgs.indexOf(process.argv[2]) === -1) {
    console.error('Usage: node git-packages-tagger.js [--major | --minor | --patch (default)]')
    process.exit(1)
  }
  arg = process.argv[2]
}

const packageJson = require(path.join(process.cwd(), "package.json"));

exec("git status --porcelain", (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  if (!stdout) {
    try {
      const { version } = JSON.parse(execSync(`npm view ${packageJson.name} --json`).toString())
      const reResult = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
      let major = +reResult[1], minor = +reResult[2], patch = +reResult[3]
      switch (arg) {
        case '--major':
          major++
          minor = 0
          patch = 0
          break
        case '--minor':
          minor++
          patch = 0
          break
        case '--patch':
          patch++
          break
        default:
          console.error('Wrong value', arg)
          process.exit(1)
      }
      const incrementedVersion = `${major}.${minor}.${patch}`
      console.log(`Incrementing version: ${version} -> ${incrementedVersion}`)
      packageJson.version = incrementedVersion
    } catch {
      console.error('Cannot fetch latest package version!')
      process.exit(1)
    }

    exec(`git tag -a ${packageJson.name}/v${packageJson.version} -m "${packageJson.name}/v${packageJson.version} Release"`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      if (!stdout) {
        console.log(`Tag ${packageJson.name}/v${packageJson.version} added successfully`);
        process.exit(0);
      } else {
        console.log(stdout);
        process.exit(1);
      }
    });
  } else {
    console.log(`Commit or revert these changes before adding a new tag release: \n${stdout}`);
    process.exit(1);
  }
});
