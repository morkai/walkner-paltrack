'use strict';

exports.id = 'paltrack-frontend';

exports.modules = [
  'updater',
  'mongoose',
  'settings',
  'events',
  'pubsub',
  'user',
  'express',
  'users',
  'feedback',
  'partners',
  'palletKinds',
  'registry',
  'httpServer',
  'sio'
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      '*.added', '*.edited'
    ],
    info: [
      'events.**'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted',
      'registry.*.edited', 'registry.*.deleted'
    ],
    error: [

    ]
  }
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80
};

exports.pubsub = {
  statsPublishInterval: 10000,
  republishTopics: [
    'events.saved',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'updater.newVersion',
    'settings.updated.**',
    'registry.*.added', 'registry.*.edited', 'registry.*.deleted', 'registry.gdn.printed.**',
    'registry.*.checked',
    'balance.daily.*', 'balance.current.*'
  ]
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {},
  models: [
    'setting', 'event', 'user', 'feedback',
    'partner', 'palletKind',
    'grn', 'gdn', 'ob', 'dailyBalance'
  ]
};

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'paltrack.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: null
  },
  cookieSecret: '1ee7\\/\\/alkner-paltrack',
  ejsAmdHelpers: {
    t: 'app/i18n'
  }
};

exports.user = {
  privileges: [
    'USERS:VIEW', 'USERS:MANAGE',
    'EVENTS:VIEW', 'EVENTS:MANAGE',
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'REGISTRY:VIEW', 'REGISTRY:MANAGE', 'REGISTRY:CHECK',
    'REPORTS:VIEW'
  ]
};

exports.updater = {
  manifestPath: __dirname + '/manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  }
};

exports.registry = {
  gdnStoragePath: __dirname + '/../data/gdn'
};
