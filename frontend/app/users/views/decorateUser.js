// Part of <https://miracle.systems/p/walkner-paltrack> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/data/partners'
], function(
  t,
  partners
) {
  'use strict';

  return function(model)
  {
    var obj = model.toJSON();
    var partner = partners.get(model.get('partner'));

    if (partner)
    {
      obj.partner = partner.getLabel();
    }

    return obj;
  };
});
