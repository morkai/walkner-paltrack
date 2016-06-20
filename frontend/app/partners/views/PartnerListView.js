// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/views/ListView',
  '../util/createColorTdAttrs',
  '../util/decoratePartner'
], function(
  t,
  ListView,
  createColorTdAttrs,
  decoratePartner
) {
  'use strict';

  return ListView.extend({

    className: 'partners-list is-clickable',

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
      },
      {
        id: 'autoGdnText',
        noData: t('core', 'BOOL:false'),
        label: t('partners', 'PROPERTY:autoGdn')
      },
      {
        id: 'autoGrn1Text',
        noData: t('core', 'BOOL:false'),
        label: t('partners', 'PROPERTY:autoGrn1')
      },
      {
        id: 'autoGrn2Text',
        noData: t('core', 'BOOL:false'),
        label: t('partners', 'PROPERTY:autoGrn2')
      }
    ],

    serializeRow: decoratePartner

  });
});
