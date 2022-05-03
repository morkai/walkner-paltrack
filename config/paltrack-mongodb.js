'use strict';

module.exports = {
  uri: process.env.PALTRACK_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-paltrack',
  keepAliveQueryInterval: 15000,
  mongoClient: {
    minPoolSize: 1,
    maxPoolSize: 10,
    noDelay: true,
    keepAlive: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 0,
    forceServerObjectId: false,
    writeConcern: {
      w: 1,
      wtimeoutMS: 15000
    },
    autoIndex: process.env.NODE_ENV !== 'production',
    enableUtf8Validation: false
  }
};

if (process.env.PALTRACK_MONGODB_REPLICA_SET)
{
  module.exports.mongoClient.replicaSet = process.env.PALTRACK_MONGODB_REPLICA_SET;
}
