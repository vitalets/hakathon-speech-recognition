const {
  LOG_LEVEL,
} = process.env;

// export as config var to be able to change values in tests.
export const config = {
  googleBucket: 'hakathon',
  googleAuthFile: '.env.google.json',
  googleUseMocks: true,
  logLevel: LOG_LEVEL || 'info',
};
