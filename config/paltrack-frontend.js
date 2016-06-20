'use strict';

const mongodb = require('./paltrack-mongodb');

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/]
  });
}
catch (err) {}

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

exports.mainJsFile = 'paltrack-main.js';
exports.mainCssFile = 'assets/paltrack-main.css';

exports.dashboardUrlAfterLogIn = '/';

exports.dictionaryModules = {
  partners: 'PARTNERS',
  palletKinds: 'PALLET_KINDS'
};

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
    'registry.*.added', 'registry.*.edited', 'registry.*.deleted', 'registry.*.checked.**',
    'balance.daily.**', 'balance.current.*'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: [
    'setting', 'event', 'user', 'passwordResetRequest', 'feedback',
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
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 3600 * 8 * 1000,
    touchChance: 0
  },
  cookieSecret: '1ee7\\/\\/alkner-paltrack',
  ejsAmdHelpers: {
    t: 'app/i18n'
  },
  title: 'PalTrack',
  jsonBody: {limit: '1mb'}
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
  manifestPath: __dirname + '/paltrack-manifest.appcache',
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
  versionsKey: 'paltrack',
  manifests: [
    {
      path: '/manifest.appcache',
      mainJsFile: exports.mainJsFile,
      mainCssFile: exports.mainCssFile
    }
  ]
};

exports.registry = {
  gdnStoragePath: __dirname + '/../data/gdn',
  automate: true
};
