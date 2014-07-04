// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/partners',

    clientUrlRoot: '#partners',

    topicPrefix: 'partners',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'partners',

    labelAttribute: 'name',

    defaults: {
      name: '',
      address: null,
      clientNo: null,
      supplierColor: null,
      receiverColor: null
    }

  });
});
