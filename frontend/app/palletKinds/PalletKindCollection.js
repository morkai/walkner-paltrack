// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

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
