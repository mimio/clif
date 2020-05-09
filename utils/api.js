export function apiUrl(path, req) {
  if (req && typeof window === 'undefined') {
    // this is running server-side, so we need an absolute URL
    const { host } = req.headers;

    if (host && host.startsWith('localhost')) {
      return `http://localhost:3000${path}`;
    }
    return `https://${host}${path}`;
  }
  // this is running client-side, so a relative path is fine
  return path;
}
