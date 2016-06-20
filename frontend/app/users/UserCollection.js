// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './User'
], function(
  Collection,
  User
) {
  'use strict';

  return Collection.extend({

    model: User,

    rqlQuery: 'select(lastName,firstName,email,login,partner)&sort(+lastName,+firstName)&limit(15)'

  });
});
