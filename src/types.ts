type Path = string;

type RetVal = {
  success: boolean;
  error?: string;
};

interface RetBuffer extends RetVal {
  value?: Buffer;
}

interface RetString extends RetVal {
  value?: string;
}

interface RetBool extends RetVal {
  value?: boolean;
}

interface RetPath extends RetVal {
  value?: Path;
}

export {
  Path,
  RetBool,
  RetString,
  RetVal,
  RetPath,
  RetBuffer,
};
