// Runtime config for API endpoints
// Uses a local proxy when on localhost/127.0.0.1/::1, otherwise hits the platform directly.

const USE_PROXY = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

export const AUTH_ENDPOINT = USE_PROXY
  ? '/api/auth/signin'
  : 'https://platform.zone01.gr/api/auth/signin';

export const GQL_ENDPOINT = USE_PROXY
  ? '/api/graphql'
  : 'https://platform.zone01.gr/api/graphql-engine/v1/graphql';
