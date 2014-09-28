// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

module.exports = function setUpChecker(app, registryModule)
{
  var mongoose = app[registryModule.config.mongooseId];
  var Grn = mongoose.model('Grn');

  app.broker.subscribe('registry.grn.added', function(message)
  {
    checkGn(message.model);
  });

  app.broker.subscribe('registry.grn.edited', function(message)
  {
    checkGn(message.model);
  });

  app.broker.subscribe('registry.grn.deleted', function(message)
  {
    checkGn(message.model, message.user, new Date(), false);
  });

  app.broker.subscribe('registry.gdn.added', function(message)
  {
    checkGn(message.model);
  });

  app.broker.subscribe('registry.gdn.edited', function(message)
  {
    checkGn(message.model);
  });

  app.broker.subscribe('registry.gdn.deleted', function(message)
  {
    checkGn(message.model, message.user, new Date(), false);
  });

  app.broker.subscribe('registry.grn.checked.*', function(message)
  {
    if (message.auto)
    {
      return;
    }

    Grn.findById(message.id, function(err, grn)
    {
      if (err)
      {
        return registryModule.error(
          "Failed to find GN [%s] after it was checked: %s", message.id, err.message
        );
      }

      if (grn)
      {
        checkGn(grn, message.checker, new Date(), message.checked);
      }
    });
  });

  function checkGn(gn, checker, checkedAt, checked)
  {
    gn.findRelatedGn(function(err, relatedGn)
    {
      if (err)
      {
        return registryModule.error(
          "Failed to find GN for checking after [%s] was added: %s", gn._id, err.message
        );
      }

      if (!relatedGn || relatedGn.checked === gn.checked)
      {
        return;
      }

      relatedGn.checkedAt = checkedAt || gn.checkedAt;
      relatedGn.checker = checker || gn.checker;
      relatedGn.checked = checked === undefined ? gn.checked : checked;

      relatedGn.changes.push({
        createdAt: relatedGn.checkedAt,
        creator: relatedGn.checker,
        oldValues: {checked: !relatedGn.checked},
        newValues: {checked: relatedGn.checked}
      });

      relatedGn.save(function(err)
      {
        if (err)
        {
          return registryModule.error("Failed to save [%s] after checking: %s", relatedGn._id, err.message);
        }

        app.broker.publish(relatedGn.constructor.TOPIC_PREFIX + '.checked.' + relatedGn._id, {
          id: relatedGn._id.toString(),
          checked: relatedGn.checked,
          checker: relatedGn.checker,
          auto: true
        });
      });
    });
  }
};
