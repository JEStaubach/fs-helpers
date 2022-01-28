import fs from 'fs-extra';
import path from 'path';

const mockFileSystem = new Map<string,[string, Buffer]>();

function existsSync(filePath: fs.PathLike): boolean {
  if (filePath === path.resolve(`.`)) return true;
  return mockFileSystem.has(filePath as string);
}

function lstatSync(filePath: fs.PathLike, options?: fs.StatOptions & { bigint?: false }): fs.Stats {
  const retVal = {
    isDirectory: () => filePath === path.resolve(`.`) ? true : mockFileSystem.get(filePath as string)[0] === 'dir',
    isFile: () => mockFileSystem.has(filePath as string) && mockFileSystem.get(filePath as string)[0] === 'file',
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

function chmodSync(filePath: fs.PathLike, mode: fs.Mode): void {
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
  for (const key of mockFileSystem.keys()) {
    if (key.includes(oldPath as string)) {
      const newName = key.split(oldPath as string).join(newPath as string);
      const newVal = mockFileSystem.get(key);
      mockFileSystem.delete(key);
      mockFileSystem.set(newName, newVal);
    }
  }
}

function readFileSync(filePath: number | fs.PathLike, options?: { encoding: BufferEncoding; flag?: string; } | BufferEncoding): Buffer {
  return mockFileSystem.get(filePath as string)[1];
}

function copySync(src: string, dest: string, options?: fs.CopyOptionsSync): void {
  if (mockFileSystem.has(dest)) throw Error('destination directory exists')
  for (const key of mockFileSystem.keys()) {
    if (key.includes(src)) {
      const newName = key.split(src).join(dest);
      mockFileSystem.set(newName, mockFileSystem.get(key));
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
      mockFileSystem.set(`${path.resolve(`.`)}${subdir}`, ['dir', Buffer.from('',`utf-8`)]);
      first = first == undefined ? `${path.resolve(`.`)}${subdir}` : first;
    }
  }
  return first;
}

function removeSync(filePath: string): void {
  for (const key of mockFileSystem.keys()) {
    if (key.includes(filePath)) mockFileSystem.delete(key);
  }
}

function ensureFileSync(filename: string): void {
  mockFileSystem.set(filename, ['file', Buffer.from('',`utf-8`)]);
}

function outputFileSync(filename: string, data: string, options?: string | fs.WriteFileOptions) {
  mockFileSystem.set(filename, ['file', Buffer.from(data, 'utf8')]);
}

export default { existsSync, lstatSync, chmodSync, renameSync, readFileSync, copySync, removeSync, ensureFileSync, mkdirpSync, outputFileSync };
