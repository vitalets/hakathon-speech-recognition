const {
  LOG_LEVEL,
} = process.env;

// export as config var to be able to change values in tests.
export const config = {
  googleBucket: 'hakathon',
  googleAuthFile: '.auth.google.json',
  googleUseMocks: true,
  punctuationApi: 'http://punct.toys.dialogic.digital/restore-punct',
  logLevel: LOG_LEVEL || 'info',
};
