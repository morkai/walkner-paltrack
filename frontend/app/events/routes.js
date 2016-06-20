// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './EventCollection',
  'i18n!app/nls/events'
], function(
  router,
  viewport,
  user,
  EventCollection
) {
  'use strict';

  router.map('/events', user.auth('EVENTS:VIEW'), function(req)
  {
    viewport.loadPage('app/events/pages/EventListPage', function(EventListPage)
    {
      return new EventListPage({
        collection: new EventCollection(null, {
          rqlQuery: req.rql
        })
      });
    });
  });
});
