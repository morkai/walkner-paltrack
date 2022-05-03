'use strict';

const ROOT_PATH = `${__dirname}/..`;
const DATA_PATH = `${ROOT_PATH}/data`;

const fs = require('fs-extra');
const mongodb = require('./paltrack-mongodb');

try
{
  require('pmx').init({
    ignore_routes: [/socket\.io/] // eslint-disable-line camelcase
  });
}
catch (err) {} // eslint-disable-line no-empty

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
        PRODUCTION_DATA_START_DATE: exports.productionDataStartDate,
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

exports.events = {
  collection: app => app.mongoose.model('Event').collection,
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
  key: `${ROOT_PATH}/config/https.key`,
  cert: `${ROOT_PATH}/config/https.crt`
};

exports.sio = {
  httpServerIds: ['httpServer'],
  socketIo: {
    pingInterval: 20000,
    pingTimeout: 7500
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
    maxPoolSize: 10
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
    maxAge: 3600 * 24 * 90 * 1000,
    sameSite: 'lax',
    secure: false
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
  ],
  noSessionPatterns: [
    req =>
    {
      if (req.headers['x-api-key']
        || req.headers.cookie
        || req.headers['x-wmes-app'] === 'main'
        || req.url === '/')
      {
        return false;
      }

      if (req.url.startsWith('/ping'))
      {
        return true;
      }

      return !!req.headers['user-agent'] && req.headers['user-agent'].includes('X11');
    }
  ]
};

exports.user = {
  privileges: [
    'DICTIONARIES:VIEW', 'DICTIONARIES:MANAGE',
    'REPORTS:VIEW'
  ]
};

exports.users = {
  browsePrivileges: ['USER'],
  loginIn: {},
  loginAs: {}
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

exports.registry = {
  gdnStoragePath: `${__dirname}/../data/gdn`,
  automate: true
};
