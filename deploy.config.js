module.exports = {
  authKeyFile: '.auth.yandex.json',
  functionName: 'hakathon-recognition',
  deploy: {
    files: [ 'package*.json', 'dist/**', '.auth.google.json' ],
    handler: 'dist/serverless/index.handler',
    runtime: 'nodejs16',
    timeout: 600,
    memory: 256,
    environment: {
      NODE_ENV: 'production',
    },
  }
};
