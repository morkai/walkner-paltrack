/* global module */
(function(root)
{
  'use strict';

  var packages = [];

  var paths = {
    'text': 'vendor/require/text',
    'i18n': 'vendor/require/i18n',
    'domReady': 'vendor/require/domReady',
    'css': 'vendor/require-css/css',
    'require-css': 'vendor/require-css',
    'underscore': 'vendor/underscore',
    'jquery': 'vendor/jquery',
    'backbone': 'vendor/backbone',
    'backbone.layout': 'vendor/backbone.layoutmanager',
    'moment': 'vendor/moment/moment',
    'moment-lang': 'vendor/moment/lang',
    'moment-timezone': 'vendor/moment/moment-timezone',
    'bootstrap': 'vendor/bootstrap/js/bootstrap',
    'bootstrap-colorpicker': 'vendor/bootstrap-colorpicker/js/bootstrap-colorpicker',
    'socket.io': 'vendor/socket.io',
    'h5.pubsub': 'vendor/h5.pubsub',
    'h5.rql': 'vendor/h5.rql',
    'form2js': 'vendor/form2js',
    'js2form': 'vendor/js2form',
    'select2': 'vendor/select2/select2',
    'select2-lang': 'vendor/select2-lang',
    'zeroclipboard': 'vendor/zeroclipboard/ZeroClipboard'
  };

  var shim = {
    'underscore': {
      exports: '_'
    },
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    'bootstrap': ['jquery'],
    'bootstrap-colorpicker': ['bootstrap'],
    'select2': {
      deps: ['jquery'],
      exports: 'Select2'
    }
  };

  if (typeof module === 'object' && module.exports)
  {
    module.exports = {
      packages: packages,
      paths: paths,
      shim: shim,
      buildPaths: paths,
      buildShim: shim
    };
  }
  else
  {
    var locale = null;

    if (root.localStorage)
    {
      locale = root.localStorage.getItem('LOCALE');
    }

    if (!locale && root.navigator)
    {
      locale = navigator.languages ? navigator.languages[0] : navigator.language;
    }

    if (!locale)
    {
      locale = root.LOCALE;
    }

    if (!locale)
    {
      locale = 'pl';
    }

    locale = locale.split('-')[0];
    locale = locale === 'en' ? 'en' : 'pl';

    root.appLocale = locale;
    root.require = {
      baseUrl: '/',
      packages: packages,
      paths: paths,
      shim: shim,
      waitSeconds: 20,
      config: {
        i18n: {
          locale: locale
        }
      }
    };
  }
})(typeof self !== 'undefined' ? self : this);
