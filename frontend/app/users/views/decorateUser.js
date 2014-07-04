// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

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
