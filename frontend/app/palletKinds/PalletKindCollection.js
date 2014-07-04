// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../core/Collection',
  './PalletKind'
], function(
  Collection,
  PalletKind
) {
  'use strict';

  return Collection.extend({

    model: PalletKind,

    rqlQuery: 'sort(position)',

    comparator: 'position'

  });
});
