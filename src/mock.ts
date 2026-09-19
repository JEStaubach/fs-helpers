import fs from 'fs-extra';
import path from 'node:path';

const mockFileSystem = new Map<string,[string, string]>();
type EntryReplacement = { source: string; target: string; deleteSource: boolean };

function seedFile(fileName: string): void {
  const {root, dir, } = path.parse(fileName);
  const separatedPathMinusRoot = dir.split(root).slice(1).join(root).split(path.sep);
  for (let i = 0; i < separatedPathMinusRoot.length; i++) {
    const subpath = [root, separatedPathMinusRoot.slice(0,i+1).join(path.sep)].join('');
    mkdirpSync(subpath);
  }
  const seedData = fs.readFileSync(fileName).toString();
  outputFileSync(fileName, seedData);

}

function readFileSync(filePath: string, _options?: { encoding: BufferEncoding; flag?: string; } | BufferEncoding): Buffer {
  const [ _type, data ] = mockFileSystem.get(filePath) || ['',''];
  return Buffer.from(data);
}

function outputFileSync(filename: string, data: string, _options?: fs.WriteFileOptions) {
  mockFileSystem.set(filename, ['file', data]);
}

function existsSync(filePath: fs.PathLike): boolean {
  if (filePath === path.resolve(`.`)) return true;
  return mockFileSystem.has(filePath as string);
}

function lstatSync(filePath: fs.PathLike, _options?: fs.StatOptions & { bigint?: false }): fs.Stats {
  const [ type, _data ] = mockFileSystem.get(filePath as string) || ['',''];
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
  const oldName = oldPath as string;
  const newName = newPath as string;
  if (!mockFileSystem.has(oldName)) throw new ENOENTError('source path not found');
  replaceEntries(oldName, newName, true);
}

function replaceEntries(source: string, target: string, deleteSource: boolean): void {
  const replacement = { source, target, deleteSource };
  for (const key of Array.from(mockFileSystem.keys())) {
    replaceEntry(key, replacement);
  }
}

function replaceEntry(key: string, replacement: EntryReplacement): void {
  if (!key.includes(replacement.source)) return;
  const newName = key.split(replacement.source).join(replacement.target);
  const value = mockFileSystem.get(key) || /* istanbul ignore next */ ['',''];
  if (replacement.deleteSource) mockFileSystem.delete(key);
  mockFileSystem.set(newName, value);
}

function copySync(src: string, dest: string, _options?: fs.CopyOptionsSync): void {
  if (mockFileSystem.has(dest)) throw new Error('destination directory exists');
  replaceEntries(src, dest, false);
}

function createMissingDirectories(dirs: string[]): string | undefined {
  let first = undefined;
  const rootPath = path.resolve(`.`);
  for (let i = 0; i < dirs.length; i++) {
    const subdir = dirs.slice(0,i+1).join(path.sep);
    const fullPath = `${rootPath}${subdir}`;
    first = createDirectoryIfMissing(fullPath, subdir, first);
  }
  return first;
}

function createDirectoryIfMissing(fullPath: string, subdir: string, first: string | undefined): string | undefined {
  if (mockFileSystem.has(fullPath) || subdir === '') return first;
  mockFileSystem.set(fullPath, ['dir', '']);
  return first ?? fullPath;
}

function mkdirpSync(dir: string): string | undefined {
  if (lstatSync(dir).isFile()) throw new Error('file exists at destination');
  const dirs = dir.split(path.resolve(`.`)).join('').split(path.sep);
  return createMissingDirectories(dirs);
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
