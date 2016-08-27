"use strict";

var builder = require('botbuilder');
var wechatAPI = require('wechat-api');
var wechat = require('wechat');

var WechatConnector = (function() {
    function WechatConnector(opts) {
        this.options = Object.assign({}, opts);

        console.log(this.options);
    }

    WechatConnector.prototype.listen = function () {
        return function() {};
    };

    WechatConnector.prototype.processMessage = function (line) {

    };

    WechatConnector.prototype.onEvent = function (handler) {
        // this.handler = handler;
    };

    WechatConnector.prototype.send = function (messages, cb) {

    };

    WechatConnector.prototype.startConversation = function (address, cb) {

    };

    return WechatConnector;
})();

exports.WechatConnector = WechatConnector;