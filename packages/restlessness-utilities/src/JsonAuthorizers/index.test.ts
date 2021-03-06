import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import Project from '../Project';
import JsonAuthorizers from '.';

const PROJECT_NAME = 'tmp-json-authorizer';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

describe('JsonAuthorizers model', () => {
  test('it should create an empty list',  async (done) => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    await JsonAuthorizers.read();
    expect(JsonAuthorizers.entries.length).toBe(0);
    done();
  });
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});
