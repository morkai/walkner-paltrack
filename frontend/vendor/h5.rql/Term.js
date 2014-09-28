define(function (require, exports, module) {// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under the MIT License <http://opensource.org/licenses/MIT>.
// Part of the h5.rql project <http://lukasz.walukiewicz.eu/p/h5.rql>

'use strict';

module.exports = Term;

/**
 * @constructor
 * @param {string} [name]
 * @param {Array} [args]
 */
function Term(name, args)
{
  /**
   * @type {string|null}
   */
  this.name = name || null;

  /**
   * @type {Array}
   */
  this.args = args || [];
}

});
