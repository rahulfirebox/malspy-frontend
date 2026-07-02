interface LogMeta {
  orgId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
}

const IS_DEV = process.env.NODE_ENV !== 'production';



const nativeConsole = globalThis.console;

export const logger = {
  debug: (msg: string, meta?: LogMeta) => {
    if (IS_DEV) nativeConsole.debug('[DEBUG]', msg, meta);
  },
  info: (msg: string, meta?: LogMeta) => {
    if (IS_DEV) nativeConsole.info('[INFO]', msg, meta);
  },
  warn: (msg: string, meta?: LogMeta) => {
    if (IS_DEV) nativeConsole.warn('[WARN]', msg, meta);
  },
  error: (msg: string, meta?: LogMeta) => {
    if (IS_DEV) nativeConsole.error('[ERROR]', msg, meta);
  },
};
