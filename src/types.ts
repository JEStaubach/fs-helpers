type Path = string; //NOSONAR

type RetVal = {
  success: boolean;
  error?: string | null;
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

export type {
  Path,
  RetBool,
  RetString,
  RetVal,
  RetPath,
  RetBuffer,
};
