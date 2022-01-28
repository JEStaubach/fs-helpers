import fsExtra from 'fs-extra';
import path from 'path';
import { Path, RetBool, RetPath, RetString, RetVal } from 'src/types';
import mock from 'src/mock';

function use(fsLibrary: any): any {
  const { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, removeSync, ensureFileSync, outputFileSync, mkdirpSync } = fsLibrary;

  function checkIfFileExists(filePath: Path): RetBool {
    const absPath = getAbsolutePath(filePath).value;
    if (!existsSync(absPath)) {
      return {
        success: true,
        value: false,
        error: null,
      };
    }
    if (!lstatSync(absPath).isFile()) {
      return {
        success: false,
        value: false,
        error: `checkIfFileExists: '${filePath}' is not a file.`,
      };
    }
    return {
      success: true,
      value: true,
      error: null,
    };
  }

  function checkIfDirExists(dir: Path): RetBool {
    const absDir = getAbsolutePath(dir).value;
    if (!existsSync(absDir)) {
      return {
        success: true,
        value: false,
        error: null,
      };
    }
    if (!lstatSync(absDir).isDirectory()) {
      return {
        success: false,
        value: false,
        error: `checkIfDirExists: '${dir}' is not a directory.`,
      };
    }
    return {
      success: true,
      value: true,
      error: null,
    };
  }

  function getAbsolutePath(dir: Path): RetPath {
    try {
      if (dir.match(/^[.a-zA-Z0-9\-_/:\\]+$/g) === null) {
        throw Error(`Dir contains unsupported characters. Received ${dir}.`);
      }
      const absPath = path.normalize(path.resolve(dir));
      return {
        success: true,
        value: absPath,
        error: null,
      };
    } catch (err) {
      console.error(`Error resolving path: ${dir}`);
      return {
        success: false,
        value: undefined,
        error: `Error resolving path: '${dir}'. Received error: '${err}'`,
      };
    }
  }

  function createDir(dir: Path): RetPath {
    try {
      if (dir === undefined) {
        throw Error(`Function "createDir" expected a path. Recieved "${dir}".`);
      }
      const absDir = getAbsolutePath(dir).value;
      return {
        success: true,
        value: ((mkdirpSync(absDir) as unknown) as string),
        error: null,
      };
    } catch (err) {
      console.error(`Error creating dir: ${dir}`);
      return {
        success: false,
        value: undefined,
        error: `Error creating dir: '${dir}'`,
      };
    }
  }

  function touchFile(filePath: Path, perms?: number): RetVal {
    const absPath = getAbsolutePath(filePath).value;
    ensureFileSync(absPath);
    if (perms !== undefined) {
      chmodSync(absPath, perms);
    }
    return {
      success: true,
      error: null,
    };
  }

  function rimrafDir(dir: Path): RetPath {
    const absPath = getAbsolutePath(dir).value;
    if (absPath !== undefined && checkIfDirExists(dir).value) {
      removeSync(dir);
      return {
        success: true,
        value: dir,
        error: null,
      };
    }
    console.error(`Error deleting dir: ${dir}`);
    return {
      success: false,
      value: undefined,
      error: `Error deleting dir: '${dir}'`,
    };
  }

  function rimrafDirs(dirs: Path[]): RetPath[] {
    return dirs.map((dir) => {
      return rimrafDir(getAbsolutePath(dir).value);
    });
  }

  function abortDirCreation(dir: Path): RetVal {
    if (dir !== null && checkIfDirExists(dir).value) {
      console.error(`Cleaning up due to abort, directories created starting at: ${JSON.stringify(dir)}`);
      rimrafDir(dir);
      return {
        success: true,
        error: null,
      };
    }
    console.error(`Cleaning up due to abort, no directory to clean up.`);
    return {
      success: false,
      error: `Cleaning up due to abort, no directory to clean up.`,
    };
  }

  function renameDir(oldPath: Path, newPath: Path): RetString {
    try {
      renameSync(getAbsolutePath(oldPath).value, getAbsolutePath(newPath).value);
      return {
        success: true,
        value: `Successfully renamed the directory.`,
        error: null,
      };
    } catch (err) {
      console.error(err.code);
      return {
        success: false,
        value: undefined,
        error: `renameDir from '${oldPath}' to '${newPath} failed.`
      };
    }
  }

  function readFile(fileName: Path, overrideMock: boolean = false): RetString {
    if (overrideMock) {
      return {
        success: true,
        value: fsExtra.readFileSync(getAbsolutePath(fileName).value, `utf-8`) as unknown as string,
        error: null,
      }
    }
    return {
      success: true,
      value: readFileSync(getAbsolutePath(fileName).value, `utf-8`) as unknown as string,
      error: null,
    };
  }

  function writeFile(fileName: Path, data: string): RetVal {
    outputFileSync(getAbsolutePath(fileName).value, data);
    return {
      success: true,
      error: null
    };
  }

  function copyDirAbs(src: Path, dest: Path): RetVal {
    try {
      copySync(getAbsolutePath(src).value, getAbsolutePath(dest).value, { overwrite: false, errorOnExist: true });
      return {
        success: true,
        error: null,
      };
    } catch (err) {
      return {
        success: false,
        error: `Error copying absolute from '${src}' to '${dest}'`,
      };
    }
  }

  return {
    getAbsolutePath,
    abortDirCreation,
    checkIfDirExists,
    copyDirAbs,
    createDir,
    renameDir,
    rimrafDir,
    rimrafDirs,
    checkIfFileExists,
    readFile,
    writeFile,
    touchFile
  };
}

export default { use, default: fsExtra, mock };