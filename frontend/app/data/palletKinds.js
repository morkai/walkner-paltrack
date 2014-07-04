// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
