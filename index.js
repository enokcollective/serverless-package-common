'use strict';

const symlink = require('./src/symlink');

class PackageCommon {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = Object.assign({
      common: []
    }, this.serverless.service.custom && this.serverless.service.custom.packageCommon || {});

    this.symlinked = false;

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.beforeDeploy.bind(this),
      'after:deploy:deploy': this.afterDeploy.bind(this)
    };

    this.handleExit();
  }

  beforeDeploy() {
    // Symlink common folders
    return Promise.all(this.options.common.map(commonFolder => {
        this.symlinked = true;
        return symlink.createFolder(commonFolder, this.serverless);
      }))
      .then(() => {
        this.serverless.cli.log(`[serverless-package-common] Package Common is complete`);
      });
  }

  handleExit(func) {
    ['SIGINT', 'SIGTERM', 'SIGQUIT']
      .forEach(signal => process.on(signal, () => {
        this.afterDeploy();
      }));
  }
}

module.exports = PackageCommon;
