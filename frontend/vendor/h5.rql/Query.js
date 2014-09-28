define(function (require, exports, module) {// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under the MIT License <http://opensource.org/licenses/MIT>.
// Part of the h5.rql project <http://lukasz.walukiewicz.eu/p/h5.rql>

'use strict';

var Term = require('./Term');
var stringSerializer = require('./serializers/stringSerializer');

module.exports = Query;

/**
 * @constructor
 */
function Query()
{
  /**
   * @type {Term}
   */
  this.selector = new Term('and');

  /**
   * @type {object.<string, boolean>}
   */
  this.fields = {};

  /**
   * @type {number}
   */
  this.skip = 0;

  /**
   * @type {number}
   */
  this.limit = -1;

  /**
   * @type {object.<string, number>}
   */
  this.sort = {};
}

/**
 * @param {object} obj
 * @param {object} [obj.selector]
 * @param {object.<string, boolean>} [obj.fields]
 * @param {number} [obj.skip]
 * @param {number} [obj.limit]
 * @param {object.<string, number>} [obj.sort]
 * @returns {Query}
 */
Query.fromObject = function(obj)
{
  if (obj instanceof Query)
  {
    return obj;
  }

  var query = new Query();

  if (!obj)
  {
    return query;
  }

  if (obj.selector)
  {
    query.selector = obj.selector;
  }

  if (obj.fields)
  {
    query.fields = obj.fields;
  }

  if (obj.skip)
  {
    query.skip = obj.skip;
  }

  if (obj.limit)
  {
    query.limit = obj.limit;
  }

  if (obj.sort)
  {
    query.sort = obj.sort;
  }

  return query;
};

/**
 * @param {object} [options]
 * @returns {string}
 */
Query.prototype.toString = function(options)
{
  return stringSerializer.fromQuery(this, options);
};

/**
 * @returns {boolean}
 */
Query.prototype.isEmpty = function()
{
  return this.skip === 0
    && this.limit === -1
    && Object.keys(this.fields).length === 0
    && Object.keys(this.sort).length === 0
    && this.selector.args.length === 0;
};

});
