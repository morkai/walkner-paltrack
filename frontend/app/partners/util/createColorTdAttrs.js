// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-paltrack project <http://lukasz.walukiewicz.eu/p/walkner-paltrack>

define([

], function(

) {
  'use strict';

  return function createColorTdAttrs(row, colorProperty)
  {
    if (!colorProperty)
    {
      colorProperty = this.colorProperty || this.id;
    }

    if (!row[colorProperty])
    {
      return '';
    }

    return 'class="partners-color" style="background-color: ' + row[colorProperty] + '"';
  };
});
