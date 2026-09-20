import fsh from '../src/index';
import path from 'path';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

// create all test directories and files inside one root directory for easy cleanup
const rootTestDir = `.testDir`;
type TestResult = {
  success: boolean;
  value?: boolean | string | Buffer;
  error?: string | null;
};

// iterate over mocked and unmocked versions of the library
const fsLibraryVariations = {
  mocked: fsh.use(fsh.mock, [`LICENSE`, `src/types.ts`]),
  unmocked: fsh.use(fsh.default),
}

describe(`mock readFile fallback`, () => {
  it(`returns an empty buffer when a mocked file is missing`, () => {
    const res = fsLibraryVariations.mocked.readFile(`missing-file`);
    expect(res.success).toBe(true);
    expect(res.value?.toString()).toBe(``);
    expect(res.error).toBeNull();
  });
});

Object.entries(fsLibraryVariations).forEach(([key, fsHelpers]) => {

  // iterate over providng functions relative and absolute paths
  const pathVersions: Record<string, (pathArg: string) => string> = {
    relative: (pathArg: string) => pathArg,
    absolute: (pathArg: string) => {
      const resolvedPath = fsHelpers.getAbsolutePath(pathArg).value;
      if (resolvedPath === undefined) {
        throw new Error(`Unable to resolve test path: ${pathArg}`);
      }
      return resolvedPath;
    },
  };
  Object.entries(pathVersions).forEach(([pathVersion, pathResolver]) => {

    // setup
    beforeEach(() => {
      if (fsHelpers.checkIfDirExists(`${rootTestDir}`).value) {
        fsHelpers.rimrafDir(`${rootTestDir}`);
      }
      vi.resetAllMocks();
    });

    // teardown
    afterEach(() => {
      if (fsHelpers.checkIfDirExists(`${rootTestDir}`).value) {
        fsHelpers.rimrafDir(`${rootTestDir}`);
      }
    });

    describe(`[${key}]-[${pathVersion}] seedFile`, () => {
      it(`sucessfully returns true when checking existence of a seeded file`, () => {
        // Check File Existence (should exist - seeded when mocked)
        let res: TestResult = fsHelpers.checkIfFileExists(pathResolver(`src/types.ts`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`sucessfully returns true when checking existence of parent dir`, () => {
        // Check Dir Existence (should exist - created when seeding file when mocked)
        let res: TestResult = fsHelpers.checkIfDirExists(pathResolver(`src`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });
    });

    describe(`[${key}]-[${pathVersion}] checkIfFileExists`, () => {
      it(`sucessfully returns true when checking existence of a path to a file`, () => {
        // Create a temporary directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // Check if directory exists (it should)
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // Create a file
        res = fsHelpers.touchFile(pathResolver(`${rootTestDir}/checkFile`), 0);
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check File Existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/checkFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`successfully returns false when a file does not exist`, () => {
        // Check File Existence (should not exist)
        let res: TestResult = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
      });

      it(`fails and produces an error when checking for the existence of a file on a directory`, () => {
        // Create a temporary directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // Check File Existence (path is to a dir)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(false);
        expect(res.value).toBe(false);
        expect(res.error).toContain(`is not a file.`);
      });
    });

    describe(`[${key}]-[${pathVersion}] checkIfDirExists`, () => {
      it(`successfully returns true if directory exists, current working directory`, () => {
        // check if cwd exists (it should)
        let res: TestResult = fsHelpers.checkIfDirExists(pathResolver(`.`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`successfully returns true if directory exists, temporary directory`, () => {
        // Create a temporary directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // temp directory should exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`successfully returns false if directory doesn't exist`, () => {
        // this directory is assumed not to exist
        let res: TestResult = fsHelpers.checkIfDirExists(pathResolver(`./SoMeThInG/uNuSuAl`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
      });

      it(`fails and errors out if checking existence of directory which is a file`, () => {
        // Create a temporary directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // create a temp file
        res = fsHelpers.touchFile(pathResolver(`${rootTestDir}/checkDir`), 0);
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check existence of a directory which is a file
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/checkDir`));
        expect(res.success).toBe(false);
        expect(res.value).toBe(false);
        expect(res.error).toContain('is not a directory.');
      });
    });

    describe(`[${key}]-[${pathVersion}] getAbsolutePath`, () => {
      it(`successfully returns an absolute path when provided a path`, () => {
        let res: TestResult = fsHelpers.getAbsolutePath(pathResolver(`sOmEtHiNg/UnUsUaL`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(path.resolve(`./sOmEtHiNg/UnUsUaL`));
        expect(res.error).toBeNull();
      });

      it(`fails and errors out if provided a bad dir name`, () => {
        const spy = vi.spyOn(console, `error`);
        const res = fsHelpers.getAbsolutePath(`<ABC`);
        expect(res.success).toBe(false);
        expect(res.value).toBeUndefined();
        expect(res.error).toContain(`Error resolving path: '<ABC'. Received error: 'Error: Dir contains unsupported characters. Received <ABC.'`);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenLastCalledWith(`Error resolving path: <ABC`);
      });
    });

    describe(`[${key}]-[${pathVersion}] createDir`, () => {
      it(`successfully creates a directory and returns the first directory in path created`, () => {
        // check existence of the directory (should not exist)
        let res: TestResult = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        res = fsHelpers.createDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // check existence of the directory (should exist)
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`fails and returns error if provided a path to a file`, () => {
        const spyLog = vi.spyOn(console, `log`);
        const spyErr = vi.spyOn(console, `error`);

        // Ensure file exists
        let res: TestResult = fsHelpers.touchFile(pathResolver(`LICENSE`));
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check file existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`LICENSE`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // try creating a directory with same name as an existing file
        res = fsHelpers.createDir(pathResolver(`LICENSE`));
        expect(res.success).toBe(false);
        expect(res.value).toBeUndefined();
        expect(res.error).toContain('Error creating dir');
        expect(spyErr).toHaveBeenLastCalledWith(`Error creating dir: ${pathResolver(`LICENSE`)}`);
        expect(spyLog).not.toHaveBeenCalled();
      });

      it(`fails and returns an error if no path provided`, () => {
        let res: TestResult = fsHelpers.createDir(undefined);
        expect(res.success).toBe(false);
        expect(res.value).toBeUndefined();
        expect(res.error).toContain(`Error creating dir:`);
        expect(console.error).toHaveBeenLastCalledWith(`Error creating dir: ${undefined}`);
      });
    });

    describe(`[${key}]-[${pathVersion}] rimrafDir`, () => {
      it(`successfully deletes a directory and contents`, () => {
        // create nested directories
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}/modules`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        expect(console.error).not.toHaveBeenCalled();
        // check that the directories were created (child directory should exist)
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/modules`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // delete the parent directory
        res = fsHelpers.rimrafDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(pathResolver(`${rootTestDir}`));
        expect(res.error).toBeNull();
        expect(console.error).not.toHaveBeenCalled();
        // check that the directories were deleted (parent directory should not exist)
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
      });

      it(`fails and returns an error when attempting to delete a directory that doesn't exist`, () => {
        // directory to delete should not exist
        let res: TestResult = fsHelpers.checkIfDirExists(pathResolver(`sOmEtHiNg`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // try to delete a non-existent direcotry (should fail and produce an error)
        res = fsHelpers.rimrafDir(pathResolver(`sOmEtHiNg`));
        expect(res.success).toBe(false);
        expect(res.value).toBeUndefined();
        expect(res.error).toContain(`Error deleting dir:`);
        expect(console.error).toHaveBeenLastCalledWith(`Error deleting dir: ${pathResolver(`sOmEtHiNg`)}`);
      });

      it(`fails and returns an error when attempting to delete a directory that is not a dir`, () => {
        // Check file existence (should exist)
        let res: TestResult = fsHelpers.checkIfFileExists(pathResolver(`LICENSE`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // attempt to delete a directory that is an existing file
        res = fsHelpers.rimrafDir(pathResolver(`LICENSE`));
        expect(res.success).toBe(false);
        expect(res.value).toBeUndefined();
        expect(res.error).toContain(`Error deleting dir:`);
        expect(console.error).toHaveBeenLastCalledWith(`Error deleting dir: ${pathResolver(`LICENSE`)}`);
        // Check file existence (should still exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`LICENSE`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });
    });

    describe(`[${key}]-[${pathVersion}] rimrafDirs`, () => {
      it(`should successfully delete dirs that exist and fail to delete dirs that do not, returning the results in an array`, () => {
        // create 1st directory to delete
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}/dir1`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // 1st directory to delete should exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/dir1`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // 2nd directory to delete
        res = fsHelpers.createDir(pathResolver(`${rootTestDir}/dir2`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}/dir2`).value);
        expect(res.error).toBeNull();
        // 2nd directory to delete should exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/dir2`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // 3rd directory to delete (should not exist)
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/dir3`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // delete all 3 directories
        const results = fsHelpers.rimrafDirs([
          pathResolver(`${rootTestDir}/dir1`),
          pathResolver(`${rootTestDir}/dir2`),
          pathResolver(`${rootTestDir}/dir3`),
        ]);
        // deleting existing directories should succeed, and non-existing should fail
        expect(results[0].success).toBe(true);
        expect(results[1].success).toBe(true);
        expect(results[2].success).toBe(false);
        // should return the directory deleted when successful, and undefined when not
        expect(results[0].value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}/dir1`).value);
        expect(results[1].value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}/dir2`).value);
        expect(results[2].value).toBeUndefined();
        // should return an error when not successful deleting, and null when successful
        expect(results[0].error).toBeNull();
        expect(results[1].error).toBeNull();
        expect(results[2].error).toBe(`Error deleting dir: '${fsHelpers.getAbsolutePath(`${rootTestDir}/dir3`).value}'`);
        // 1st directory should no longer exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/dir1`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // 2nd directory should no longer exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/dir2`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // 3rd directory should still not exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/dir3`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
      });
    });

    describe(`[${key}]-[${pathVersion}] abortDirCreation`, () => {
      it(`successfully clenas up directory created, for recovering from a process failure`, () => {
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // delete the directory that was created
        if (typeof res.value !== `string`) {
          throw new Error(`Expected createDir to return a path`);
        }
        res = fsHelpers.abortDirCreation(pathResolver(path.relative(path.resolve(`.`), res.value)));
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        expect(console.error).toHaveBeenLastCalledWith(
          `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
            pathResolver(`${rootTestDir}`),
          )}`,
        );
      });

      it(`fails and returns an error if no dir to cleanup`, () => {
        const spy = vi.spyOn(console, `error`);
        let res: TestResult = fsHelpers.abortDirCreation(null);
        expect(res.success).toBe(false);
        expect(res.error).toContain(`no directory to clean up`);
        expect(spy).toHaveBeenLastCalledWith(`Cleaning up due to abort, no directory to clean up.`);
      });
    });

    describe(`[${key}]-[${pathVersion}] renameDir`, () => {
      it(`fails and returns an error when provided nonexistent source directory`, () => {
        const spy = vi.spyOn(console, `error`);
        let res: TestResult = fsHelpers.renameDir(pathResolver(`./doesNotExist`), pathResolver(`./doesNotExistEither`));
        expect(res.success).toBe(false);
        expect(res.value).toBeUndefined();
        expect(res.error).toContain(`failed.`);
        expect(spy).toHaveBeenLastCalledWith(`ENOENT`);
      });

      it(`successfully renames the src dir to the dest dir`, () => {
        // create the src directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}/firstName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // ensure the src directory exists
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/firstName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // expect the dest directory not to exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/secondName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // rename the source directory to the dest directory name
        res = fsHelpers.renameDir(pathResolver(`${rootTestDir}/firstName`), pathResolver(`${rootTestDir}/secondName`));
        expect(res.success).toBe(true);
        expect(res.value).toContain(`Successfully renamed the directory.`);
        expect(res.error).toBeNull();
        // the src directory should no longer exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/firstName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // the dest directory should now exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/secondName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`successfully renames the src dir to the dest dir - fixed bug when dest dir contains src dir`, () => {
        // create the src directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}/firstName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // ensure the src directory exists
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/firstName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // expect the dest directory not to exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/firstName2`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // rename the source directory to the dest directory name
        res = fsHelpers.renameDir(pathResolver(`${rootTestDir}/firstName`), pathResolver(`${rootTestDir}/firstName2`));
        expect(res.success).toBe(true);
        expect(res.value).toContain(`Successfully renamed the directory.`);
        expect(res.error).toBeNull();
        // the src directory should no longer exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/firstName`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // the dest directory should now exist
        res = fsHelpers.checkIfDirExists(pathResolver(`${rootTestDir}/firstName2`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });
    });

    describe(`[${key}]-[${pathVersion}] readFile and writeFile`, () => {
      it(`sucessfully creates a directory, writes a file, and reads the same data back from the file`, () => {
        // Create a temporary directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // Check File Existence (should not exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // Write file
        res = fsHelpers.writeFile(pathResolver(`${rootTestDir}/testFile`), 'TEST "FILE" CONTENTS');
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check File Existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // Read File
        res = fsHelpers.readFile(pathResolver(`${rootTestDir}/testFile`));
        expect(res.success).toBe(true);
        if (!(res.value instanceof Buffer)) {
          throw new Error(`Expected readFile to return a Buffer`);
        }
        expect(res.value.toString(`utf-8`)).toBe('TEST "FILE" CONTENTS');
        expect(res.error).toBeNull();
      });

      it(`sucessfully reads an existing file`, () => {
        // Check File Existence (should exist - seeded when mocked)
        let res: TestResult = fsHelpers.checkIfFileExists(pathResolver(`LICENSE`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // Override mocking and read actual file
        res = fsHelpers.readFile(pathResolver(`LICENSE`));
        expect(res.success).toBe(true);
        if (!(res.value instanceof Buffer)) {
          throw new Error(`Expected readFile to return a Buffer`);
        }
        expect(res.value.toString(`utf-8`)).toContain(`PROVIDED "AS IS", WITHOUT`);
        expect(res.error).toBeNull();
      });
    });

    describe(`[${key}]-[${pathVersion}] copyDir`, () => {
      it(`successfully copies a src directory to dest directory`, () => {
        // Create a temporary src directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}/srcDir`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // Check src file existence (should not exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // Create src file
        res = fsHelpers.touchFile(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check src file existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // Check dest file existence (should not exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/destDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // copy src dir to dest dir
        res = fsHelpers.copyDirAbs(pathResolver(`${rootTestDir}/srcDir`), pathResolver(`${rootTestDir}/destDir`));
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check dest file existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/destDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`successfully copies a src directory to dest directory`, () => {
        // Create a temporary src directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}/srcDir`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // Check src file existence (should not exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // Create src file
        res = fsHelpers.touchFile(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check src file existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // Check dest file existence (should not exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir2/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // copy src dir to dest dir
        res = fsHelpers.copyDirAbs(pathResolver(`${rootTestDir}/srcDir`), pathResolver(`${rootTestDir}/srcDir2`));
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check dest file existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir2/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
      });

      it(`fails and returns an error if copying a diretory and the dest dir exists`, () => {
        // Create a temporary src directory
        let res: TestResult = fsHelpers.createDir(pathResolver(`${rootTestDir}/srcDir`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}`).value);
        expect(res.error).toBeNull();
        // Check src file existence (should not exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // Create src file
        res = fsHelpers.touchFile(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check src file existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/srcDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // Create a temporary dest directory
        res = fsHelpers.createDir(pathResolver(`${rootTestDir}/destDir`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(fsHelpers.getAbsolutePath(`${rootTestDir}/destDir`).value);
        expect(res.error).toBeNull();
        // Check dest file existence (should not exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/destDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(false);
        expect(res.error).toBeNull();
        // Create dest file
        res = fsHelpers.touchFile(pathResolver(`${rootTestDir}/destDir/testFile`), 0);
        expect(res.success).toBe(true);
        expect(res.error).toBeNull();
        // Check dest file existence (should exist)
        res = fsHelpers.checkIfFileExists(pathResolver(`${rootTestDir}/destDir/testFile`));
        expect(res.success).toBe(true);
        expect(res.value).toBe(true);
        expect(res.error).toBeNull();
        // copy src dir to dest dir
        res = fsHelpers.copyDirAbs(pathResolver(`${rootTestDir}/srcDir`), pathResolver(`${rootTestDir}/destDir`));
        expect(res.success).toBe(false);
        expect(res.error).toContain(`Error copying absolute`);
      });
    });
  });
});
