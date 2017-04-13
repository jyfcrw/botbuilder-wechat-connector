"use strict";

var _            = require('lodash'),
    builder      = require('botbuilder'),
    wechat       = require('wechat'),
    WechatAPI    = require('wechat-api');

const AttachmentType = {
    Image:      'wechat/image',
    Voice:      'wechat/voice',
    Video:      'wechat/video',
    ShortVideo: 'wechat/shortvideo',
    Link:       'wechat/link',
    Location:   'wechat/location',
    Music:      'wechat/music',
    News:       'wechat/news',
    MpNews:     'wechat/mpnews',
    Card:       'wechat/card'
};

const maxAttempts = 3;

var WechatConnector = (function() {
    function WechatConnector(opts) {
        this.options = _.assign({
            enableReply: false
        }, opts);

        this.wechatAPI = new WechatAPI(this.options.appID, this.options.appSecret, this.options.readAccessToken, this.options.writeAccessToken);
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
            conversation: {
                id: 'Convo1',
                wechatMessage: wechatMessage
            }
        };

        msg = new builder.Message()
            .address(addr)
            .timestamp(convertTimestamp(wechatMessage.CreateTime))
            .entities();

        if (msgType === 'text') {
            msg = msg.text(wechatMessage.Content);
        } else {
            msg = msg.text('');
        }

        if (msgType === 'image') {
            atts.push({
                contentType: AttachmentType.Image,
                content: {
                    url: wechatMessage.PicUrl,
                    mediaId: wechatMessage.MediaId
                }
            });
        }

        if (msgType === 'voice') {
            atts.push({
                contentType: AttachmentType.Voice,
                content: {
                    format: wechatMessage.Format,
                    mediaId: wechatMessage.MediaId,
                    recognition: wechatMessage.Recognition
                }
            });
        }

        if (msgType === 'video') {
            atts.push({
                contentType: AttachmentType.Video,
                content: {
                    mediaId: wechatMessage.MediaId,
                    thumbMediaId: wechatMessage.ThumbMediaId
                }
            });
        }

        if (msgType === 'shortvideo') {
            atts.push({
                contentType: AttachmentType.ShortVideo,
                content: {
                    mediaId: wechatMessage.MediaId,
                    thumbMediaId: wechatMessage.ThumbMediaId
                }
            });
        }

        if (msgType === 'link') {
            atts.push({
                contentType: AttachmentType.Link,
                content: {
                    title: wechatMessage.Title,
                    description: wechatMessage.Description,
                    url: wechatMessage.Url
                }
            });
        }

        if (msgType === 'location') {
            atts.push({
                contentType: AttachmentType.Location,
                content: {
                    locationX: wechatMessage.Location_X,
                    locationY: wechatMessage.Location_Y,
                    scale: wechatMessage.Scale,
                    label: wechatMessage.Label
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
            this.postMessage(messages[i], cb);
        }
    };

    WechatConnector.prototype.startConversation = function (address, cb) {
        var addr = _.assign(address, {
            conversation: { id: 'Convo1' }
        });

        cb(null, addr);
    };

    WechatConnector.prototype.postMessage = function (message, cb) {
        message = JSON.parse(JSON.stringify(message));
        message.attempts = 1;

        // Retry callback
        var callback = (error) => {
            if (error && message.attempts < maxAttempts) {
                message.attempts++;
                postMessage(this, message, callback);
            }
            else {
                if (cb) {
                    cb(error);
                }
            }
        };

        postMessage(this, message, callback);
    };

    function postMessage(connector, message, callback) {
        var user = message.address.user;

        if (message.text && message.text.length > 0) {
            connector.wechatAPI.sendText(user.id, message.text, callback);
        }

        if (message.attachments && message.attachments.length > 0) {
            for (var i = 0; i < message.attachments.length; i++) {
                var atm = message.attachments[i],
                    atmType = atm.contentType,
                    atmCont = atm.content;

                if (!atmCont) continue;

                switch(atmType) {
                    case AttachmentType.Image:
                        connector.wechatAPI.sendImage(user.id, atmCont.mediaId, callback);
                        break;
                    case AttachmentType.Voice:
                        connector.wechatAPI.sendVoice(user.id, atmCont.mediaId, callback);
                        break;
                    case AttachmentType.Video:
                        connector.wechatAPI.sendVideo(user.id, atmCont.mediaId, atmCont.thumbMediaId, callback);
                        break;
                    case AttachmentType.Music:
                        connector.wechatAPI.sendMusic(user.id, atmCont, callback);
                        break;
                    case AttachmentType.News:
                        connector.wechatAPI.sendNews(user.id, atmCont, callback);
                        break;
                    case AttachmentType.MpNews:
                        connector.wechatAPI.sendMpNews(user.id, atmCont.mediaId, callback);
                        break;
                    case AttachmentType.Card:
                        connector.wechatAPI.sendCard(user.id, atmCont, callback);
                        break;
                    default:
                        // Unknow attachment
                        break;
                }
            }
        }
    }

    function convertTimestamp(ts) {
        return new Date(parseInt(ts) * 1000).toISOString();
    }

    return WechatConnector;
})();

exports.WechatConnector      = WechatConnector;
exports.WechatAttachmentType = AttachmentType;