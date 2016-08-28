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
        var msg,
            addr,
            atts = [],
            msgType = wechatMessage.MsgType;

        if (!this.handler) {
            throw new Error('Error no handler');
        }

        addr = {
            channelId: 'wechat',
            user: { id: wechatMessage.FromUserName, name: 'Unknow' },
            bot: { id: wechatMessage.ToUserName, name: 'Bot' },
            conversation: { id: 'Convo1' }
        };

        msg = new builder.Message()
                         .address(addr)
                         .timestamp() // wechatMessage.CreateTime
                         .entities();

        if (msgType == 'text') {
            msg = msg.text(wechatMessage.Content);
        } else {
            msg = msg.text('');
        }

        if (msgType == 'image') {
            atts.push({
                contentType: 'application/octet-stream',
                content: {
                    url: wechatMessage.PicUrl,
                    mediaId: wechatMessage.MediaId
                }
            });
        }

        msg = msg.attachments(atts);
        this.handler([msg.toMessage()]);
        return this;
    };

    WechatConnector.prototype.onEvent = function (handler) {
        this.handler = handler;
    };

    WechatConnector.prototype.send = function (messages, cb) {
        for (var i = 0; i < messages.length; i++) {
            this.postMessage(messages[i]);
        }
    };

    WechatConnector.prototype.startConversation = function (address, cb) {
        var addr = _.assign(address, {
            conversation: { id: 'Convo1' }
        });

        cb(null, addr);
    };

    WechatConnector.prototype.postMessage = function (message, cb) {
        var addr = message.address;

        if (message.text) {
            this.wechatAPI.sendText(addr.user.id, message.text, errorHandle);
        }
    };

    function errorHandle(err) {
        if (err) {
            console.log('Error', err);
        }
    }

    return WechatConnector;
})();

exports.WechatConnector = WechatConnector;