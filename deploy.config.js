const env = require('./.env');

module.exports = {
  oauthToken: env.YC_OAUTH_TOKEN,
  folderId: env.YC_FOLDER_ID,
  functionName: 'hakathon-recognition',
  deploy: {
    files: [ 'package*.json', 'dist/**/*.js', '.env.google.json' ],
    handler: 'dist/serverless/index.handler',
    runtime: 'nodejs16-preview',
    timeout: 30,
    memory: 128,
    environment: {
      NODE_ENV: 'production',
    },
  }
};
