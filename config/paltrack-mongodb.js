'use strict';

module.exports = {
  uri: 'mongodb://127.0.0.1:27017/walkner-paltrack',
  user: process.env.PALTRACK_MONGODB_USER || '',
  pass: process.env.PALTRACK_MONGODB_PASS || '',
  server: {
    poolSize: 7
  },
  db: {
    w: 1,
    wtimeout: 1000,
    nativeParser: true,
    forceServerObjectId: false
  }
};
