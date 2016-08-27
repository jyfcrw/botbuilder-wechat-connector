"use strict";

var _            = require('lodash'),
    builder      = require('botbuilder'),
    wechat       = require('wechat'),
    WechatAPI    = require('wechat-api');

var WechatConnector = (function() {
    function WechatConnector(opts) {
        this.options = _.assign({
            enableReply: false
        }, opts);

        this.wechatAPI = new WechatAPI(this.options.appID, this.options.appSecret);
    }

    WechatConnector.prototype.listen = function () {
        var self = this;
        var config = this.options.appToken;

        if (!!this.options.encodingAESKey) {
            config = {
                token: this.options.appToken,
                appid: this.options.appID,
                encodingAESKey: this.options.encodingAESKey
            };
        }

        return wechat(config, function(req, res, next) {
            if (!self.options.enableReply) {
                var msg = req.weixin,
                    type = msg.MsgType;

                self.processMessage(msg, type);
                res.status(200).end();
            } else {
                next();
            }
        });
    };

    WechatConnector.prototype.processMessage = function (msg, type) {
        this.wechatAPI.sendText(msg.FromUserName, "hi!", function (err) {
            if (err) {
                console.log('Error sending message', err);
            }
        });
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