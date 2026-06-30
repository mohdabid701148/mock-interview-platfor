// In-memory access token store.
//
// The access token lives ONLY in JavaScript memory — it is never written to
// localStorage, sessionStorage, cookies, or IndexedDB. This module is the single
// bridge between the axios interceptors (which run outside React and cannot use
// hooks) and AuthContext (the React source of truth for auth state).
//
// - axios reads the token via getAccessToken() and writes the rotated token via
//   setAccessToken() after a silent refresh.
// - AuthContext subscribes via subscribeAccessToken() to mirror the token into
//   React state (so SocketContext can react to token changes).
// - axios calls triggerAuthFailure() when a refresh ultimately fails so the
//   React layer can clear the user and redirect to /login.

let accessToken = null;
let tokenSubscriber = null; // (token: string | null) => void
let authFailureHandler = null; // () => void

export const getAccessToken = () => accessToken;

export const setAccessToken = (token) => {
  accessToken = token || null;
  if (tokenSubscriber) tokenSubscriber(accessToken);
};

export const clearAccessToken = () => setAccessToken(null);

// Register a single subscriber (AuthContext) that mirrors the token into React
// state. Returns an unsubscribe function.
export const subscribeAccessToken = (fn) => {
  tokenSubscriber = fn;
  return () => {
    if (tokenSubscriber === fn) tokenSubscriber = null;
  };
};

export const setAuthFailureHandler = (fn) => {
  authFailureHandler = fn;
};

export const triggerAuthFailure = () => {
  if (authFailureHandler) authFailureHandler();
};
