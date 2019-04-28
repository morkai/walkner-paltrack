// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  '../data/partners'
], function(
  Model,
  partners
) {
  'use strict';

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    topicPrefix: 'users',

    privilegePrefix: 'USERS',

    nlsDomain: 'users',

    labelAttribute: 'login',

    defaults: function()
    {
      return {
        privileges: []
      };
    },

    getLabel: function()
    {
      var lastName = this.get('lastName') || '';
      var firstName = this.get('firstName') || '';

      return lastName.length && firstName.length ? (lastName + ' ' + firstName) : this.get('login');
    },

    serialize: function()
    {
      var obj = this.toJSON();
      var partner = partners.get(obj.partner);

      if (partner)
      {
        obj.partner = partner.getLabel();
      }

      return obj;
    }

  });
});
