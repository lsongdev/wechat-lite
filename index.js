'use strict';

const WeChat  = require('./lib');
// expose
WeChat.Client = require('./lib/client');
WeChat.Server = require('./lib/server');
WeChat.MINA   = require('./lib/wxapp');
/**
 * [exports]
 * @type {[WeChat]}
 */
module.exports = WeChat;
