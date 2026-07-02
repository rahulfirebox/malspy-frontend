type Subscriber = (token: string | null) => void;

let _isRefreshing = false;
const _subscribers: Subscriber[] = [];
let _timeoutId: ReturnType<typeof setTimeout> | null = null;

export const tokenRefreshMutex = {
  get isRefreshing(): boolean {
    return _isRefreshing;
  },

  start(): void {
    _isRefreshing = true;
    _timeoutId = setTimeout(() => {
      tokenRefreshMutex.reject();
    }, 15_000);
  },

  subscribe(cb: Subscriber): void {
    _subscribers.push(cb);
  },

  resolve(token: string): void {
    if (_timeoutId) {
      clearTimeout(_timeoutId);
      _timeoutId = null;
    }
    _subscribers.forEach(cb => cb(token));
    _subscribers.length = 0;
    _isRefreshing = false;
  },

  reject(): void {
    if (_timeoutId) {
      clearTimeout(_timeoutId);
      _timeoutId = null;
    }
    _subscribers.forEach(cb => cb(null));
    _subscribers.length = 0;
    _isRefreshing = false;
  },
};
