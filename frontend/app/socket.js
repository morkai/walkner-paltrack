// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'socket.io',
  'app/broker',
  'app/core/Socket'
],
function(
  _,
  sio,
  broker,
  Socket
) {
  'use strict';

  var query = {};

  if (window.ArrayBuffer && window.Uint8Array && window.TextDecoder)
  {
    query.binary = '1';
  }

  if (window.WMES_GET_COMMON_HEADERS)
  {
    Object.assign(query, window.WMES_GET_COMMON_HEADERS());// eslint-disable-line new-cap
  }

  var socket = new Socket(sio({
    path: '/sio',
    transports: ['websocket'],
    timeout: 20000,
    reconnectionDelay: 1000,
    reconnectionDelayMax: window.ENV === 'development' ? 1000 : 20000,
    autoConnect: false,
    query: query
  }));

  var wasConnected = false;
  var wasReconnecting = false;

  socket.on('connecting', function()
  {
    broker.publish('socket.connecting', false);
  });

  socket.on('connect', function()
  {
    if (!wasConnected)
    {
      wasConnected = true;

      broker.publish('socket.connected', false);
    }
  });

  socket.on('connect_error', function()
  {
    if (!wasConnected)
    {
      broker.publish('socket.connectFailed', false);
    }
  });

  socket.on('message', function(message)
  {
    broker.publish('socket.message', message);
  });

  socket.on('disconnect', function()
  {
    broker.publish('socket.disconnected');
  });

  socket.on('reconnecting', function()
  {
    wasReconnecting = true;

    broker.publish('socket.connecting', true);
  });

  socket.on('reconnect', function()
  {
    wasReconnecting = false;

    broker.publish('socket.connected', true);
  });

  socket.on('reconnect_error', function()
  {
    if (wasReconnecting)
    {
      wasReconnecting = false;

      broker.publish('socket.connectFailed', true);
    }
  });

  socket.on('error', function()
  {
    if (wasReconnecting)
    {
      broker.publish('socket.connectFailed', true);
    }
  });

  window.socket = socket;

  return socket;
});
