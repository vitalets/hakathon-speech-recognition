const {
  LOG_LEVEL,
} = process.env;

// export as config var to be able to change values in tests.
export const config = {
  googleBucket: 'hakathon',
  googleAuthFile: '.auth.google.json',
  googleUseMocks: false,
  punctuationApi: 'http://84.252.141.1:5000/restore-punct',
  logLevel: LOG_LEVEL || 'info',
};
