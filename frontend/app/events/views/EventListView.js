// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/i18n',
  'app/data/partners',
  'app/core/views/ListView',
  'app/events/templates/list',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  partners,
  ListView,
  listTemplate,
  userInfoTemplate
) {
  'use strict';

  return ListView.extend({

    template: listTemplate,

    remoteTopics: {
      'events.saved': 'refreshCollection'
    },

    serialize: function()
    {
      var view = this;

      return {
        events: this.collection.map(function(event)
        {
          var type = event.get('type');
          var data = view.prepareData(type, event.get('data'));
          var user = event.get('user');
          var userInfo = null;

          if (user)
          {
            userInfo = {
              id: user._id,
              label: user.name,
              ip: user.ipAddress
            };
          }

          return {
            severity: event.getSeverityClassName(),
            time: time.format(event.get('time'), 'lll'),
            user: userInfoTemplate({userInfo: userInfo}),
            type: t('events', 'TYPE:' + type),
            text: t('events', 'TEXT:' + type, view.flatten(data))
          };
        })
      };
    },

    refreshCollection: function(events, force)
    {
      if (typeof this.options.filter === 'function'
        && Array.isArray(events)
        && !events.some(this.options.filter))
      {
        return;
      }

      return ListView.prototype.refreshCollection.call(this, events, force);
    },

    prepareData: function(type, data)
    {
      /*jshint -W015*/

      if (data.$prepared)
      {
        return data;
      }

      data.$prepared = true;

      switch (type)
      {
        case 'registry.ob.added':
        case 'registry.ob.edited':
        case 'registry.ob.deleted':
          var partner = partners.get(data.model.partner);

          data.model.partner = partner ? partner.getLabel() : null;
          data.model.date = time.format(data.model.date, 'YYYY-MM-DD');
          break;
      }

      return data;
    },

    flatten: function(obj)
    {
      var result = {};

      if (obj == null)
      {
        return result;
      }

      var keys = Object.keys(obj);

      for (var i = 0, l = keys.length; i < l; ++i)
      {
        var key = keys[i];
        var value = obj[key];

        if (value !== null && typeof value === 'object')
        {
          var flatObj = this.flatten(value);
          var flatKeys = Object.keys(flatObj);

          for (var ii = 0, ll = flatKeys.length; ii < ll; ++ii)
          {
            result[key + '->' + flatKeys[ii]] = String(flatObj[flatKeys[ii]]);
          }
        }
        else
        {
          result[key] = _.escape(String(value));
        }
      }

      return result;
    }

  });
});
