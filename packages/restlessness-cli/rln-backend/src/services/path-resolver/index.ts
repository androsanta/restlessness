import path from 'path';
import envVars from 'root/services/env-vars';

const getPrjRoot = (): string => {
  if (envVars.isDev) {
    return process.cwd();
  }
  return envVars.prjPath;
};

const getNodeModulesRoot = (): string => path.join(getPrjRoot(), 'node_modules');

const getDistRoot = (): string => path.join(getPrjRoot(), 'dist');

const getConfigsRoot = (): string => path.join(getPrjRoot(), 'configs');

const getSrcRoot = (): string => path.join(getPrjRoot(), 'src');

const getEndpointsRoot = (): string => path.join(getSrcRoot(), 'endpoints');

const getDistEndpointsRoot = (): string => path.join(getDistRoot(), 'endpoints');

const getModelsRoot = (): string => path.join(getSrcRoot(), 'models');

const getAuthorizersRoot = (): string => path.join(getSrcRoot(), 'authorizers');

export {
  getNodeModulesRoot,
  getSrcRoot,
  getPrjRoot,
  getEndpointsRoot,
  getModelsRoot,
  getDistEndpointsRoot,
  getAuthorizersRoot,
  getConfigsRoot,
};
