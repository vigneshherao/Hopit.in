const storageKey = 'hopit_access_token';

let memoryToken = sessionStorage.getItem(storageKey);
let unauthorizedHandler = null;

export function getAccessToken() {
  return memoryToken;
}

export function setAccessToken(token) {
  memoryToken = token;

  if (token) {
    sessionStorage.setItem(storageKey, token);
  } else {
    sessionStorage.removeItem(storageKey);
  }
}

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  setAccessToken(null);
  unauthorizedHandler?.();
}
