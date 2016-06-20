// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/partners/PartnerCollection',
  './createStorage'
], function(
  PartnerCollection,
  createStorage
) {
  'use strict';

  return createStorage('PARTNERS', 'partners', PartnerCollection);
});
