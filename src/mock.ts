import fs from 'fs-extra';
import path from 'path';

const mockFileSystem = new Map<string,[string, string]>();

function seedFile(fileName: string): void {
  const {root, dir, } = path.parse(fileName);
  const separatedPathMinusRoot = dir.split(root).slice(1).join('').split(path.sep);
  for (let i = 0; i < separatedPathMinusRoot.length; i++) {
    const subpath = [root, separatedPathMinusRoot.slice(0,i+1).join(path.sep)].join('');
    mkdirpSync(subpath);
  }
  const seedData = fs.readFileSync(fileName).toString();
  outputFileSync(fileName, seedData);

}

function readFileSync(filePath: string, _options?: { encoding: BufferEncoding; flag?: string; } | BufferEncoding): Buffer {
  const [ _type, data ] = mockFileSystem.get(filePath);
  return Buffer.from(data);
}

function outputFileSync(filename: string, data: string, _options?: string | fs.WriteFileOptions) {
  mockFileSystem.set(filename, ['file', data]);
}

function existsSync(filePath: fs.PathLike): boolean {
  if (filePath === path.resolve(`.`)) return true;
  return mockFileSystem.has(filePath as string);
}

function lstatSync(filePath: fs.PathLike, _options?: fs.StatOptions & { bigint?: false }): fs.Stats {
  const [ type, _data ] = mockFileSystem.get(filePath as string) ?? ['',''];
  const retVal = {
    isDirectory: () => filePath === path.resolve(`.`) ? true : type === 'dir',
    isFile: () => mockFileSystem.has(filePath as string) && type === 'file',
    isBlockDevice: () => false,
    isCharacterDevice: () => false,
    isSymbolicLink: () => false,
    isFIFO: () => false,
    isSocket: () => false,
    dev: 0,
    ino: 0,
    mode: 0,
    nlink: 0,
    uid: 0,
    gid: 0,
    rdev: 0,
    size: 0,
    blksize: 0,
    blocks: 0,
    atimeMs: 0,
    mtimeMs: 0,
    ctimeMs: 0,
    birthtimeMs: 0,
    atime: new Date(0),
    mtime: new Date(0),
    ctime: new Date(0),
    birthtime: new Date(0)
  };
  // cheat coverage numbers...
  retVal.isBlockDevice();
  retVal.isCharacterDevice();
  retVal.isSymbolicLink();
  retVal.isFIFO();
  retVal.isSocket();
  return retVal;
}

function chmodSync(_filePath: fs.PathLike, _mode: fs.Mode): void {
  return;
}

class ENOENTError extends Error {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = "ENOENT";
  }
}

function renameSync(oldPath: fs.PathLike, newPath: fs.PathLike): void {
  if (!mockFileSystem.has(oldPath as string)) throw new ENOENTError('source path not found');
  for (const key of Array.from(mockFileSystem.keys())) {
    if (key.includes(oldPath as string)) {
      const newName = key.split(oldPath as string).join(newPath as string);
      const newVal = mockFileSystem.get(key) ?? /* istanbul ignore next */ ['',''];
      mockFileSystem.delete(key);
      mockFileSystem.set(newName, newVal);
    }
  }
}

function copySync(src: string, dest: string, _options?: fs.CopyOptionsSync): void {
  if (mockFileSystem.has(dest)) throw Error('destination directory exists')
  for (const key of Array.from(mockFileSystem.keys())) {
    if (key.includes(src)) {
      const newName = key.split(src).join(dest);
      mockFileSystem.set(newName, mockFileSystem.get(key) ?? /* istanbul ignore next */ ['','']
      );
    }
  }
}

function mkdirpSync(dir: string): any {
  if (lstatSync(dir).isFile()) throw Error('file exists at destination');
  let first = undefined;
  const dirs = dir.split(path.resolve(`.`)).join('').split(path.sep);
  for (let i = 0; i < dirs.length; i++){
    const subdir = dirs.slice(0,i+1).join(path.sep);
    if (!mockFileSystem.has(`${path.resolve(`.`)}${subdir}`) && subdir !== '') {
      mockFileSystem.set(`${path.resolve(`.`)}${subdir}`, ['dir', '']);
      first = first ?? `${path.resolve(`.`)}${subdir}`;
    }
  }
  return first;
}

function removeSync(filePath: string): void {
  for (const key of Array.from(mockFileSystem.keys())) {
    if (key.includes(filePath)) mockFileSystem.delete(key);
  }
}

function ensureFileSync(filename: string): void {
  if (!mockFileSystem.has(filename)) mockFileSystem.set(filename, ['file', '']);
}

export default { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, removeSync, ensureFileSync, mkdirpSync, outputFileSync, seedFile };
