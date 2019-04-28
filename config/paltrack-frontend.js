'use strict';

const fs = require('fs-extra');
const mongodb = require('./paltrack-mongodb');

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/]
  });
}
catch (err) {}

exports.id = 'paltrack-frontend';

Object.assign(exports, require('./paltrack-common'));

exports.modules = [
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'settings',
  'events',
  'pubsub',
  'mail/sender',
  'user',
  {id: 'h5-express', name: 'express'},
  'users',
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
      '*.added', '*.edited',
    ],
    info: [],
    warning: [
      '*.deleted'
    ],
    error: [
      'app.started'
    ]
  }
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 80
};

exports.httpsServer = {
  host: '0.0.0.0',
  port: 443,
  key: `${__dirname}/privatekey.pem`,
  cert: `${__dirname}/certificate.pem`
};

exports.sio = {
  httpServerIds: ['httpServer'],
  socketIo: {
    pingInterval: 10000,
    pingTimeout: 5000
  }
};

exports.pubsub = {
  statsPublishInterval: 60000,
  republishTopics: [
    'dictionaries.updated',
    '*.added', '*.edited', '*.deleted', '*.synced'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 10
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
};

exports.express = {
  staticPath: `${__dirname}/../frontend`,
  staticBuildPath: `${__dirname}/../frontend-build`,
  sessionCookieKey: 'paltrack.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0,
    gcInterval: 8 * 3600,
    cacheInMemory: false
  },
  cookieSecret: '1ee7\\/\\/alkner-paltrack',
  ejsAmdHelpers: {
    _: 'underscore',
    $: 'jquery',
    t: 'app/i18n',
    time: 'app/time',
    user: 'app/user',
    forms: 'app/core/util/forms'
  },
  title: 'PalTrack',
  jsonBody: {limit: '1mb'},
  routes: [
    require('../backend/routes/core')
  ]
};

exports.users = {
  browsePrivileges: ['USER']
};

exports.user = {
  privileges: [
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'REPORTS:VIEW'
  ]
};

exports['mail/sender'] = {
  smtp: {
    host: 'smtp.localhost',
    port: 465,
    secureConnection: true,
    auth: {
      user: 'support@localhost',
      pass: '123456'
    },
    maxConnections: 2
  },
  from: 'support+paltrack@localhost',
  replyTo: 'support+paltrack@localhost'
};

exports.updater = {
  manifestPath: `${__dirname}/paltrack-manifest.appcache`,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: `${__dirname}/../`,
    timeout: 30000
  },
  versionsKey: 'paltrack',
  manifests: [
    {
      frontendVersionKey: 'frontend',
      path: '/manifest.appcache',
      mainJsFile: '/paltrack-main.js',
      mainCssFile: '/assets/paltrack-main.css',
      template: fs.readFileSync(`${__dirname}/paltrack-manifest.appcache`, 'utf8'),
      frontendAppData: {
        XLSX_EXPORT: process.platform === 'win32',
        CORS_PING_URL: 'https://test.wmes.pl/ping',
        DASHBOARD_URL_AFTER_LOG_IN: '/'
      },
      dictionaryModules: {
        partners: 'PARTNERS',
        palletKinds: 'PALLET_KINDS'
      }
    }
  ]
};

exports.registry = {
  gdnStoragePath: __dirname + '/../data/gdn',
  automate: true
};
