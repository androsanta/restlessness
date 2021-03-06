import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { Project, JsonDaos } from '@restlessness/core';
import MongoDaoPackage from '.';

const PROJECT_NAME = 'tmp-mongo-dao';

const projectPath = path.join(process.cwd(), PROJECT_NAME);
process.env['RLN_PROJECT_PATH'] = projectPath;

beforeAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});

describe('Mongo Dao Package hooks', () => {
  test('New project post install',  async (done) => {
    await Project.create(projectPath, {
      installNodemodules: false,
    });
    expect((await fs.lstat(projectPath)).isDirectory()).toBe(true);
    await MongoDaoPackage.postInstall();
    await JsonDaos.read();
    const jsonDaosEntry = await JsonDaos.getEntryById('dao-mongo');
    expect(jsonDaosEntry.package).toBe('@restlessness/dao-mongo');
    await expect(MongoDaoPackage.postInstall()).rejects.toEqual(new Error('Entry with id dao-mongo already exists'));
    done();
  });
});

afterAll(async (done) => {
  await promisify(rimraf)(projectPath);
  done();
});
