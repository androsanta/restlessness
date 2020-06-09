import minimist from 'minimist';
import serve from 'serve-handler';
import path from 'path';
import { spawn } from 'child_process';

export default async (argv: minimist.ParsedArgs) => {
  const majorVersion: number = parseInt((/^(\d+)(\.\d+){0,2}$/.exec(process.versions.node))[1], 10);
  if (majorVersion < 12) {
    throw new Error('Run command requires node version >= 12.x');
  }

  const backend = spawn('serverless', ['offline', '--port', '4123'], {
    cwd: path.join(__dirname, '..', '..', 'assets', 'backend'),
    env: {
      ...process.env,
      RLN_PROJECT_PATH: process.cwd(),
    },
    stdio: 'inherit',
    shell: true,
  });
  backend.on('error', console.log);
  const frontend = spawn('serve', [], {
    cwd: path.join(__dirname, '..', '..', '..', 'lib', 'assets', 'frontend', 'build'),
    shell: true,
  });
  frontend.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  frontend.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  frontend.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
  frontend.on('error', err => {
    console.log('Error while starting frontend with serve. Maybe you forgot to install it with: npm i serve -g');
    process.exit(1);
  });
};