import proc from 'child_process';
import fs from 'fs/promises';
// import * as jq from 'node-jq';
import { Overlay, CommandPlugin, OverlayResult } from './interface';
import { escapeFilename, makeTempDir } from '../utils/core';
import path from 'path';
import { logger } from '../services/logger';
import { cmdArgs } from '../utils/cmd';

export class SoyaTransform implements CommandPlugin {
  private runJolt = async (spec: any[], data: any): Promise<OverlayResult> => {
    const specFile = 'jolt-spec.json';
    const dataFile = 'jolt-data.json';

    logger.debug(`Creating temp dir for jolt spec`);
    const [removeTempDir, tempDirPath] = await makeTempDir();
    const specFilePath = path.join(tempDirPath, specFile);

    logger.debug(`Writing jolt spec to ${specFilePath}`);
    await fs.writeFile(specFilePath, JSON.stringify(spec));

    const dataFilePath = path.join(tempDirPath, dataFile);
    logger.debug(`Writing jolt data ${dataFilePath}`);
    await fs.writeFile(dataFilePath, JSON.stringify(data));

    return new Promise<OverlayResult>((resolve) => {
      const command = cmdArgs.executable ?? 'jolt';
      const commandParams = [
        'transform',
        escapeFilename(specFilePath),
        escapeFilename(dataFilePath),
      ];

      logger.debug(`Running jolt ${command} with ${commandParams.toString()}`);
      proc.exec(command + ' ' + commandParams.join(' '), (_, stdout) => {
        logger.debug('Removing temp dir');
        removeTempDir();
        resolve({
          data: JSON.parse(stdout),
        });
      });
    });
  }

  run = (overlay: Overlay, data: any): Promise<OverlayResult> => {
    for (const item of overlay['@graph']) {
      // not a valid transformation overlay
      if (!(item.engine && item.value))
        continue;

      switch (item.engine) {
        case 'jolt':
          if (Array.isArray(item.value)) {
            return this.runJolt(item.value, data);
          }
          else
            throw new Error('jolt expects an error as input!');
        default:
          throw new Error(`Transform engine ${item.engine} not supported!`);
      }
    }

    throw new Error('No transform overlay found!');
  }
}