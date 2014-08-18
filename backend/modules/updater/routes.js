// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

module.exports = function setUpUpdaterRoutes(app, updaterModule)
{

  var express = app[updaterModule.config.expressId];

  express.get('/manifest.appcache', function(req, res)
  {
    if (app.options.env !== 'production' || typeof updaterModule.manifest !== 'string')
    {
      return res.send(404);
    }

    res.type('text/cache-manifest');
    res.send(updaterModule.manifest.replace(
      '{version}', 'v' + updaterModule.package.frontendVersion
    ));
  });
};