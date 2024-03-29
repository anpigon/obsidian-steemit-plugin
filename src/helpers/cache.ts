const memcached: Record<string, unknown> = {};

export function getCache<T>(key: string) {
  if (memcached[key]) {
    return memcached[key] as T;
  }
  return null;
}

export function setCache<T>(key: string, result: T) {
  memcached[key] = result;
}
