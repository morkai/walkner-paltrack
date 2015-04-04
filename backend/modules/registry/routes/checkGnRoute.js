// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

'use strict';

module.exports = function checkGnRoute(app, registryModule, Gn, req, res, next)
{
  var $set = {
    checkedAt: new Date(),
    checker: app[registryModule.config.userId].createUserInfo(req.session.user, req),
    checked: !!req.body.checked
  };
  var update = {
    $set: $set,
    $push: {
      changes: {
        createdAt: $set.checkedAt,
        creator: $set.checker,
        oldValues: {checked: !$set.checked},
        newValues: {checked: $set.checked}
      }
    }
  };

  Gn.update({_id: req.params.id}, update, function(err)
  {
    if (err)
    {
      return next(err);
    }

    res.sendStatus(204);

    app.broker.publish(Gn.TOPIC_PREFIX + '.checked.' + req.params.id, {
      id: req.params.id,
      checked: $set.checked,
      checker: $set.checker,
      auto: false
    });
  });
};
