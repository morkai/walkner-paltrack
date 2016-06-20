// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/palletKinds/PalletKindCollection',
  './createStorage'
], function(
  PalletKindCollection,
  createStorage
) {
  'use strict';

  return createStorage('PALLET_KINDS', 'palletKinds', PalletKindCollection);
});
