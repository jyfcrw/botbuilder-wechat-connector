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
            var wechatMessage = req.weixin;

            if (!self.options.enableReply) {
                self.processMessage(wechatMessage);
                res.status(200).end();
            } else {
                next();
            }
        });
    };

    WechatConnector.prototype.processMessage = function (wechatMessage) {
        var msg, msgType = wechatMessage.MsgType;

        var addr = {
            channelId: 'wechat',
            user: { id: wechatMessage.FromUserName, name: 'Unknow' },
            bot: { id: wechatMessage.ToUserName, name: 'Bot' },
            conversation: { id: 'Convo1' }
        };

        if (!this.handler) {
            throw new Error('Error no handler');
        }

        msg = new builder.Message().address(addr).timestamp();

        if (msgType == 'text') {
            msg.text(wechatMessage.Content);
        } else {
            msg.text("Empty");
        }

        this.handler([msg.toMessage()]);

        return this;
    };

    WechatConnector.prototype.onEvent = function (handler) {
        this.handler = handler;
    };

    WechatConnector.prototype.send = function (messages, cb) {
        for (var i = 0; i < messages.length; i++) {
            var msg  = messages[i],
                addr = msg.address;

            console.log(msg);

            if (msg.text) {
                this.wechatAPI.sendText(addr.user.id, msg.text, errorHandle);
            }
        }
    };

    WechatConnector.prototype.startConversation = function (address, cb) {
        var adr = _.assign({}, address);
        adr.conversation = { id: 'Convo1' };
        cb(null, adr);
    };

    function errorHandle(err) {
        if (err) {
            console.log('Error', err);
        }
    }

    return WechatConnector;
})();

exports.WechatConnector = WechatConnector;