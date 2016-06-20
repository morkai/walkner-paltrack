// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'backbone'
], function(
  Backbone
) {
  'use strict';

  return Backbone.Model.extend({

    idAttribute: '_id',

    urlRoot: '/',

    clientUrlRoot: null,

    topicPrefix: null,

    privilegePrefix: null,

    nlsDomain: null,

    labelAttribute: null,

    genClientUrl: function(action)
    {
      if (this.clientUrlRoot === null)
      {
        throw new Error("`clientUrlRoot` was not specified");
      }

      var url = this.clientUrlRoot;

      if (action === 'base')
      {
        return url;
      }

      url += '/';

      if (this.isNew())
      {
        url += encodeURIComponent(this.cid);
      }
      else
      {
        url += encodeURIComponent(this.id);
      }

      if (typeof action === 'string')
      {
        url += ';' + action;
      }

      return url;
    },

    getTopicPrefix: function()
    {
      return this.topicPrefix;
    },

    getPrivilegePrefix: function()
    {
      return this.privilegePrefix;
    },

    getNlsDomain: function()
    {
      return this.nlsDomain || 'core';
    },

    getLabelAttribute: function()
    {
      return this.labelAttribute || this.idAttribute;
    },

    getLabel: function()
    {
      return String(this.get(this.getLabelAttribute()));
    }

  });
});
