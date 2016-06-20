// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../core/Collection',
  './Partner'
], function(
  user,
  Collection,
  Partner
) {
  'use strict';

  return Collection.extend({

    model: Partner,

    rqlQuery: 'sort(name)',

    comparator: 'name',

    withoutUsersPartner: function()
    {
      return !user.data.partner ? this.toArray() : this.filter(function(partner)
      {
        return partner.id !== user.data.partner;
      });
    }

  });
});
