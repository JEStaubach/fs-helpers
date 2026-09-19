
import fsExtra from 'fs-extra';
import path from 'node:path';
import { RetBool, RetPath, RetString, RetVal, RetBuffer } from './types';
import mock from './mock';

class FsHelpers {
  private readonly existsSync: any;
  private readonly lstatSync: any;
  private readonly chmodSync: any;
  private readonly renameSync: any;
  private readonly readFileSync: any;
  private readonly copySync: any;
  private readonly removeSync: any;
  private readonly ensureFileSync: any;
  private readonly outputFileSync: any;
  private readonly mkdirpSync: any;
  private readonly seedFile: any;

  constructor(fsLibrary: any, seedFiles?: string[]) { //NOSONAR
    ({ existsSync: this.existsSync, lstatSync: this.lstatSync, chmodSync: this.chmodSync,
      renameSync: this.renameSync, readFileSync: this.readFileSync, copySync: this.copySync,
      removeSync: this.removeSync, ensureFileSync: this.ensureFileSync,
      outputFileSync: this.outputFileSync, mkdirpSync: this.mkdirpSync,
      seedFile: this.seedFile } = fsLibrary);

    if (this.seedFile !== undefined && seedFiles !== undefined) {
      for (const file of seedFiles) {
        this.mockExistingFile(file);
      }
    }
  }

  private mockExistingFile(fileName: string): void {
    const absPath = this.getAbsolutePath(fileName).value;
    this.seedFile(absPath);
  }

  readFile(fileName: string, options?: { encoding: BufferEncoding; flag?: string; } | BufferEncoding): RetBuffer {
    return {
      success: true,
      value: this.readFileSync(this.getAbsolutePath(fileName).value, options),
      error: null,
    };
  }

  writeFile(fileName: string, data: string): RetVal {
    this.outputFileSync(this.getAbsolutePath(fileName).value, data);
    return { success: true, error: null };
  }

  private checkIfPathExists(
    pathValue: string | undefined,
    pathType: string,
    isExpectedType: (stats: { isFile(): boolean; isDirectory(): boolean }) => boolean,
  ): RetBool {
    const absPath = this.getAbsolutePath(pathValue).value;
    if (!this.existsSync(absPath)) {
      return { success: true, value: false, error: null };
    }
    if (!isExpectedType(this.lstatSync(absPath))) {
      return {
        success: false,
        value: false,
        error: `checkIf${pathType === 'file' ? 'File' : 'Dir'}Exists: '${pathValue}' is not a ${pathType}.`,
      };
    }
    return { success: true, value: true, error: null };
  }

  checkIfFileExists(filePath: string): RetBool {
    return this.checkIfPathExists(filePath, 'file', stats => stats.isFile());
  }

  checkIfDirExists(dir: string | undefined): RetBool {
    return this.checkIfPathExists(dir, 'directory', stats => stats.isDirectory());
  }

  getAbsolutePath(dir: string | undefined): RetPath {
    try {
      if (dir === undefined) throw new Error(`Dir is undefined.`);
      if (dir.match(/^[.a-zA-Z0-9\-_/:\\]+$/g) === null) {
        throw new Error(`Dir contains unsupported characters. Received ${dir}.`);
      }
      return { success: true, value: path.normalize(path.resolve(dir)), error: null };
    } catch (err) {
      console.error(`Error resolving path: ${dir}`);
      return {
        success: false,
        value: undefined,
        error: `Error resolving path: '${dir}'. Received error: '${err}'`,
      };
    }
  }

  createDir(dir: string): RetPath {
    try {
      if (dir === undefined) throw new Error(`Function "createDir" expected a path. Recieved "${dir}".`);
      const absDir = this.getAbsolutePath(dir).value;
      const createdDir = this.mkdirpSync(absDir) as string;
      return { success: true, value: path.normalize(createdDir.replace(/^\\\\\?\\/, '')), error: null };
    } catch {
      console.error(`Error creating dir: ${dir}`);
      return { success: false, value: undefined, error: `Error creating dir: '${dir}'` };
    }
  }

  touchFile(filePath: string, perms?: number): RetVal {
    const absPath = this.getAbsolutePath(filePath).value;
    this.ensureFileSync(absPath);
    if (perms !== undefined) this.chmodSync(absPath, perms);
    return { success: true, error: null };
  }

  rimrafDir(dir: string | undefined): RetPath {
    const absPath = this.getAbsolutePath(dir).value;
    if (absPath !== undefined && this.checkIfDirExists(dir).value) {
      this.removeSync(dir);
      return { success: true, value: dir, error: null };
    }
    console.error(`Error deleting dir: ${dir}`);
    return { success: false, value: undefined, error: `Error deleting dir: '${dir}'` };
  }

  rimrafDirs(dirs: string[]): RetPath[] {
    return dirs.map(dir => this.rimrafDir(this.getAbsolutePath(dir).value));
  }

  abortDirCreation(dir: string): RetVal {
    if (dir !== null && this.checkIfDirExists(dir).value) {
      console.error(`Cleaning up due to abort, directories created starting at: ${JSON.stringify(dir)}`);
      this.rimrafDir(dir);
      return { success: true, error: null };
    }
    console.error(`Cleaning up due to abort, no directory to clean up.`);
    return { success: false, error: `Cleaning up due to abort, no directory to clean up.` };
  }

  renameDir(oldPath: string, newPath: string): RetString {
    try {
      this.renameSync(this.getAbsolutePath(oldPath).value, this.getAbsolutePath(newPath).value);
      return { success: true, value: `Successfully renamed the directory.`, error: null };
    } catch (err: any) {
      console.error(err.code);
      return { success: false, value: undefined, error: `renameDir from '${oldPath}' to '${newPath} failed.` };
    }
  }

  copyDirAbs(src: string, dest: string): RetVal {
    try {
      this.copySync(this.getAbsolutePath(src).value, this.getAbsolutePath(dest).value, { overwrite: false, errorOnExist: true });
      return { success: true, error: null };
    } catch {
      return { success: false, error: `Error copying absolute from '${src}' to '${dest}'` };
    }
  }
}

function use(fsLibrary: any, seedFiles?: string[]): FsHelpers { //NOSONAR
  return new FsHelpers(fsLibrary, seedFiles);
}

export default { use, default: fsExtra, mock };