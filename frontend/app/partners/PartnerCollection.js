// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
