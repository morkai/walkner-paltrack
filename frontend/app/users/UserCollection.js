// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
