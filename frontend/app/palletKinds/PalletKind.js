// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/palletKinds',

    clientUrlRoot: '#palletKinds',

    topicPrefix: 'palletKinds',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'palletKinds',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        name: '',
        description: null,
        no: null,
        image: null,
        position: 1
      };
    }

  });
});
