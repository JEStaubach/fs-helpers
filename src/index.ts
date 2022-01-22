import { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, removeSync, ensureFileSync, outputFileSync } from 'fs-extra';
import { sync as mkdirp } from 'mkdirp';
import { Path } from './types';

function touch(filePath: Path) {  
  ensureFileSync(filePath)
}

export default { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, mkdirp, rimraf: removeSync, touch, outputFileSync };
