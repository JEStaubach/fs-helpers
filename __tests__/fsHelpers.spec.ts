import path from 'path';
import fs from 'fs-extra';
import fsHelpers from 'src/index';
import { spy } from '__tests__/testUtils';

describe(`checkIfFileExists checks for the existence of a file`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`checkFile`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`checkFile`).value);
  });

  test(`should create a directory and a file`, () => {
    // Check File Existence (should not exist)
    let res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`checkFile`).value);
    expect(res.success).toBe(true);
    expect(res.value).toBe(false);
    expect(res.error).toBe(null);
    // Create a temporary directory
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`checkFile`).value);
    // Check File Existence (path is to a dir)
    res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`checkFile`).value);
    expect(res.success).toBe(false);
    expect(res.value).toBe(false);
    expect(res.error).toContain(`is not a file.`);
    // Create a file
    fsHelpers.touchFile(fsHelpers.getAbsolutePath(`checkFile/testFile`).value, 0);
    // Check File Existence (should exist)
    res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`checkFile/testFile`).value);
    expect(res.success).toBe(true);
    expect(res.value).toBe(true);
    expect(res.error).toBe(null);
  });
});


describe(`checkIfDirExists checks for the existence of a directory`, () => {
  beforeEach(() => {
    spy.clear();
  });

  test(`should return true if directory exists`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`.`)).value).toBe(true);
  });

  test(`should return false if directory doesn't exist`, () => {
    expect(fsHelpers.checkIfDirExists(path.resolve(`./SoMeThInG/uNuSuAl`)).value).toBe(false);
  });
});

describe(`getAbsolutePath returns an absolute path from relative or abs path`, () => {
  beforeEach(() => {
    spy.clear();
  });

  test(`should raise error if provided a bad dir name`, () => {
    const res = fsHelpers.getAbsolutePath(`<ABC`);
    expect(res.success).toBe(false);
    expect(res.value).toBe(undefined);
    expect(res.error).toContain(`Error resolving path: '<ABC'. Received error: 'Error: Dir contains unsupported characters. Received <ABC.'`);    
    expect(console.error).toHaveBeenLastCalledWith(`Error resolving path: <ABC`);    
  });

  test(`should return path relative to current direct if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(`sOmEtHiNg/UnUsUaL`).value).toBe(path.resolve(`./sOmEtHiNg/UnUsUaL`));
  });

  test(`should return path if valid relative path`, () => {
    expect(fsHelpers.getAbsolutePath(path.resolve(`.`, `sOmEtHiNg/UnUsUaL`)).value).toBe(
      path.resolve(`./sOmEtHiNg/UnUsUaL`),
    );
  });
});

describe(`createDir should create a directory at the provided location`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`bar`).value);
  });

  test(`should create a directory if provided an absolute path`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`bar`).value).value;
    expect(fsHelpers.checkIfDirExists(fsHelpers.getAbsolutePath(`bar`).value).value).toBe(true);
    expect(createdDirsStartingLocation).toBe(path.resolve(`.`, `bar`));
  });

  test(`should raise error if provided a path to a file`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(fsHelpers.getAbsolutePath(`LICENSE`).value).value;
    expect(createdDirsStartingLocation).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(`Error creating dir: ${fsHelpers.getAbsolutePath(`LICENSE`).value}`);
    expect(console.log).not.toHaveBeenCalled();
  });

  test(`should raise error if provided a relative path`, () => {
    const createdDirsStartingLocation = fsHelpers.createDir(`bar`).value;
    expect(console.error).toHaveBeenLastCalledWith(`Error creating dir: ${`bar`}`);
    expect(createdDirsStartingLocation).toBe(undefined);
  });

});

describe(`rimrafDir should delete a dir and its contents`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value);
  });

  test(`should delete a directory that exists`, () => {
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`vendor/modules`).value);
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`vendor`).value).value;
    expect(deletedDir).toBe(fsHelpers.getAbsolutePath(`vendor`).value);
    expect(console.error).not.toHaveBeenCalled();
    expect(fsHelpers.checkIfDirExists(`vendor`).value).toBe(false);
  });

  test(`should error when attempting to delete a directory that doesn't exist`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`sOmEtHiNg`).value).value;
    expect(deletedDir).toBe(undefined);
    expect(console.error).not.toHaveBeenLastCalledWith(`Error deleting dir: ${`sOmEtHiNg`}`);
    expect(fsHelpers.checkIfDirExists(`sOmEtHiNg`).value).toBe(false);
  });

  test(`should error when attempting to delete a directory that is not a dir`, () => {
    const deletedDir = fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`LICENSE`).value).value;
    expect(deletedDir).toBe(undefined);
    expect(console.error).toHaveBeenLastCalledWith(`Error deleting dir: ${fsHelpers.getAbsolutePath(`LICENSE`).value}`);
    expect(
      fs.existsSync(fsHelpers.getAbsolutePath(`LICENSE`).value) &&
        !fs.lstatSync(fsHelpers.getAbsolutePath(`LICENSE`).value).isDirectory(),
    ).toBe(true);
  });
});

describe(`rimrafDirs should delete multiple dirs and its contents`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`dir1`).value);
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`dir2`).value);
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`dir3`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`dir1`).value);
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`dir2`).value);
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`dir3`).value);
  });

  test(`should delete multiple directories that exists`, () => {
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`dir1`).value);
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`dir2`).value);
    expect(fsHelpers.checkIfDirExists(`dir1`).value).toBe(true);
    expect(fsHelpers.checkIfDirExists(`dir2`).value).toBe(true);
    expect(fsHelpers.checkIfDirExists(`dir3`).value).toBe(false);
    const res = fsHelpers.rimrafDirs([
      fsHelpers.getAbsolutePath(`dir1`).value,
      fsHelpers.getAbsolutePath(`dir2`).value,
      fsHelpers.getAbsolutePath(`dir3`).value]);
    expect(res[0].value).toBe(fsHelpers.getAbsolutePath(`dir1`).value);
    expect(res[1].value).toBe(fsHelpers.getAbsolutePath(`dir2`).value);
    expect(res[2].value).toBe(undefined);
    expect(res[0].success).toBe(true);
    expect(res[1].success).toBe(true);
    expect(res[2].success).toBe(false);
    expect(res[0].error).toBe(null);
    expect(res[1].error).toBe(null);
    expect(res[2].error).toBe(`Error deleting dir: '${fsHelpers.getAbsolutePath(`dir3`).value}'`);
    expect(fsHelpers.checkIfDirExists(`dir1`).value).toBe(false);
    expect(fsHelpers.checkIfDirExists(`dir2`).value).toBe(false);
    expect(fsHelpers.checkIfDirExists(`dir3`).value).toBe(false);
  });
});

describe(`abortDirCreation should delete dirs that were created`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`baz`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`baz`).value);
  });

  test(`should clean up any dirs created`, () => {
    const dirToDelete = fsHelpers.createDir(fsHelpers.getAbsolutePath(`baz`).value).value;
    fsHelpers.abortDirCreation(dirToDelete);
    expect(console.error).toHaveBeenLastCalledWith(
      `Cleaning up due to abort, directories created starting at: ${JSON.stringify(
        fsHelpers.getAbsolutePath(`baz`).value,
      )}`,
    );
  });

  test(`should do nothing if no dirs to cleanup`, () => {
    fsHelpers.abortDirCreation(null);
    expect(console.error).toHaveBeenLastCalledWith(`Cleaning up due to abort, no directory to clean up.`);
  });
});

describe(`renameDir should rename a directory`, () => {
  beforeEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`firstName`).value);
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`secondName`).value);
    spy.clear();
  });

  afterEach(() => {
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`firstName`).value);
    fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`secondName`).value);
  });

  test(`should err on invalid dirs`, () => {
    fsHelpers.renameDir(`./doesNotExist`, `./doesNotExistEither`);
    expect(console.error).toHaveBeenLastCalledWith(`ENOENT`);
  });

  test(`renames dir`, () => {
    fsHelpers.createDir(fsHelpers.getAbsolutePath(`firstName`).value);
    expect(fsHelpers.checkIfDirExists(`firstName`).value).toBe(true);
    expect(fsHelpers.checkIfDirExists(`secondName`).value).toBe(false);
    fsHelpers.renameDir(`firstName`, `secondName`);  
    expect(fsHelpers.checkIfDirExists(`firstName`).value).toBe(false);
    expect(fsHelpers.checkIfDirExists(`secondName`).value).toBe(true);
  })

  describe(`read a file`, () => {
    beforeEach(() => {
      fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`testDir`).value);
      spy.clear();
    });
  
    afterEach(() => {
      fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`testDir`).value);
    });
  
    test(`should create a directory, write a file, and read back the file`, () => {
      // Create a temporary directory
      fsHelpers.createDir(fsHelpers.getAbsolutePath(`testDir`).value);
      // Check File Existence (should not exist)
      let res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`testDir/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(false);
      expect(res.error).toBe(null);
      // Write file
      res = fsHelpers.writeFile(fsHelpers.getAbsolutePath(`testDir/testFile`).value, 'TEST FILE CONTENTS');
      expect(res.success).toBe(true);
      // Check File Existence (should exist)
      res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`testDir/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(true);
      expect(res.error).toBe(null);
      // Read File 
      const readData = fsHelpers.readFile(fsHelpers.getAbsolutePath(`testDir/testFile`).value);
      expect(readData.success).toBe(true);
      expect(readData.value).toBe('TEST FILE CONTENTS');
    });
  });

  describe(`copy dir`, () => {
    beforeEach(() => {
      fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`foo1`).value);
      fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`foo2`).value);
      spy.clear();
    });
  
    afterEach(() => {
      fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`foo1`).value);
      fsHelpers.rimrafDir(fsHelpers.getAbsolutePath(`foo2`).value);
    });
  
    test(`should recursively copy a src directory to dest directory`, () => {
      // Create a temporary src directory
      fsHelpers.createDir(fsHelpers.getAbsolutePath(`foo1`).value);
      // Check src file existence (should not exist)
      let res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo1/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(false);
      expect(res.error).toBe(null);
      // Create src file
      fsHelpers.touchFile(fsHelpers.getAbsolutePath(`foo1/testFile`).value, 0);
      // Check src file existence (should exist)
      res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo1/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(true);
      expect(res.error).toBe(null);
      // Check dest file existence (should not exist)
      res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo2/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(false);
      expect(res.error).toBe(null);      
      // copy src dir to dest dir 
      res = fsHelpers.copyDirAbs(fsHelpers.getAbsolutePath(`foo1`).value, fsHelpers.getAbsolutePath(`foo2`).value);
      expect(res.success).toBe(true);
      // Check dest file existence (should exist)
      res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo2/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(true);
      expect(res.error).toBe(null);
    });

    test(`should fail if dest dir exists`, () => {
      // Create a temporary src directory
      fsHelpers.createDir(fsHelpers.getAbsolutePath(`foo1`).value);
      // Check src file existence (should not exist)
      let res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo1/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(false);
      expect(res.error).toBe(null);
      // Create src file
      fsHelpers.touchFile(fsHelpers.getAbsolutePath(`foo1/testFile`).value, 0);
      // Check src file existence (should exist)
      res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo1/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(true);
      expect(res.error).toBe(null);
      // Create a temporary dest directory
      fsHelpers.createDir(fsHelpers.getAbsolutePath(`foo2`).value);
      // Check dest file existence (should not exist)
      res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo2/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(false);
      expect(res.error).toBe(null);      
      // Create dest file
      fsHelpers.touchFile(fsHelpers.getAbsolutePath(`foo2/testFile`).value, 0);
      // Check dest file existence (should exist)
      res = fsHelpers.checkIfFileExists(fsHelpers.getAbsolutePath(`foo2/testFile`).value);
      expect(res.success).toBe(true);
      expect(res.value).toBe(true);
      expect(res.error).toBe(null);
      // copy src dir to dest dir 
      res = fsHelpers.copyDirAbs(fsHelpers.getAbsolutePath(`foo1`).value, fsHelpers.getAbsolutePath(`foo2`).value);
      expect(res.success).toBe(false);
      expect(res.error).toContain(`Error copying absolute`);
    });

  });

});
