// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  'app/core/views/ListView',
  '../util/createColorTdAttrs'
], function(
  ListView,
  createColorTdAttrs
) {
  'use strict';

  return ListView.extend({

    className: 'partners-list',

    idPrefix: 'partnerList',

    columns: [
      'name',
      'clientNo',
      'address',
      {
        id: 'supplierColor',
        noData: '',
        tdAttrs: createColorTdAttrs
      },
      {
        id: 'receiverColor',
        noData: '',
        tdAttrs: createColorTdAttrs
      }
    ]

  });
});
