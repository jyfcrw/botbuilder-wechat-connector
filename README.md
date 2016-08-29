# botbuilder-wechat-connector
Microsoft Bot Framework V3 connector for Wechat office account

[![npm version](https://badge.fury.io/js/botbuilder-wechat-connector.svg)](https://badge.fury.io/js/botbuilder-wechat-connector)
[![dependencies Status](https://david-dm.org/jyfcrw/botbuilder-wechat-connector/status.svg)](https://david-dm.org/jyfcrw/botbuilder-wechat-connector)

## Features

* ready for Microsoft Bot Framework V3
* **no need a registered bot** on [dev.botframework.com](https://dev.botframework.com/), but require a certified wechat office account, go to apply [trial account](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)
* depend on [wechat](https://github.com/node-webot/wechat) and [wechat-api](https://github.com/node-webot/wechat-api) packages
* support receiving and sending almost any wechat message types
* for [express](http://expressjs.com/) framework

## Installation

```
npm install botbuilder-wechat-connector
```

## Preparation

We assume that, you don't have a certified wechat office account yet, but want to use a trial account for API testing, go to [this place](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login) to apply a trial wechat office account.

If you do have a certified wechat office account, you must know how to configure wechat message service certainly.

## Usage

**Step 1**, create your bot with wechat connector
```
var builder   = require('botbuilder'),
    connector = require('botbuilder-wechat-connector');
    
var wechatConnector = new connector.WechatConnector({
    appID: "YOUR WECHAT APP ID",
    appSecret: "YOUR WECHAT APP SECRET",
    appToken: "YOUR WECHAT TOKEN"
});

var bot = new builder.UniversalBot(wechatConnector);
```

**Step 2**, create express app as usual and use wechat connector as middleware
```
var app    = express();
app.use('/bot/wechat', wechatConnector.listen());
app.listen(9090);
```

when you configure your wechat message service, you have to offer an  available public url, if can not, try [ngrok](https://ngrok.com/). When submit this url in wechat backend, wechat server will send request to this url, so, ensure you server running good before submiting.

**Step 3**, add dialogs and you can see `message` in session object include wechat message content you sent.
```
bot.dialog('/', function (session) {
	console.log('Wechat message: ', session.message);
});
```
And, you can find media content like image, voice, video, etc in `message.attachments` of session object.
```
bot.dialog('/', function (session) {
	console.log('Wechat media: ', session.message.attachments);
});
```

for now, we include all wechat message type, as follow.
```
console.log(connector.WechatAttachmentType)

{
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
}
```

**Step 4**, sending message out is the same.

Send text message
```
bot.dialog('/', function (session) {
	session.send("Im a wechat bot!");
});
```

Send media, like image, video, etc. for example, send an image out.

```
bot.dialog('/', function (session) {
	var msg = new builder.Message(session).attachments([
		{
			contentType: 'wechat/image',
			content: {
				mediaId: 'MEDIA ID OF AN IMAGE'
			}
		}
	]);
	session.send(msg);
});
```

Want know more about `content` object, please reference this [offical document](http://mp.weixin.qq.com/wiki/11/c88c270ae8935291626538f9c64bd123.html).

### Attachment
 
Here is detail of all attachment object scheme.

#### Send attachment

**Image**
```
{
	contentType: 'wechat/image',
	content: {
		mediaId: 'MEDIA ID OF AN IMAGE'
	}
}
```

**Voice**
```
{
	contentType: 'wechat/voice',
	content: {
		mediaId: 'MEDIA ID OF VOICE'
	}
}
```

**Video**
```
{
	contentType: 'wechat/video',
	content: {
		mediaId: 'MEDIA ID OF VIDEO',
		thumbMediaId: 'MEDIA ID OF THUMB'
	}
}
```

**Music**
```
{
	contentType: 'wechat/music',
	content: {
		 title: 'TITLE',
		 description: 'DESC',
		 musicurl: 'MUSIC URL',
		 hqmusicurl: "HQ MUSIC URL",
		 thumb_media_id: "THUMB MEDIA ID"
	}
}
```

**News**
```
{
	contentType: 'wechat/news',
	content: [
		{
		    "title": "TITLE",
		    "description": "DESC",
		    "url": "NEWS URL",
		    "picurl": "PIC URL"
		 },
		 ...
	]
}
```

**MpNews**
```
{
	contentType: 'wechat/mpnews',
	content: {
		mediaId: 'MEDIA ID OF MPNEWS'
	}
}
```

**Card**
```
{
	contentType: 'wechat/card',
	content: {
		card_id: 'CARD ID',
		card_ext: 'CARD EXT'
	}
}
```

#### Receive attachment

**Image**
```
{
	contentType: 'wechat/image',
	content: {
		url: 'IMAGE URL',
		mediaId: 'MEDIA ID OF AN IMAGE'
	}
}
```

**Voice**
```
{
	contentType: 'wechat/voice',
	content: {
		format: 'FORMAT',
		recognition: 'RECOGNITION',
		mediaId: 'MEDIA ID OF VOICE'
	}
}
```

**Video**
```
{
	contentType: 'wechat/video',
	content: {
		mediaId: 'MEDIA ID OF VIDEO',
		thumbMediaId: 'MEDIA ID OF THUMB'
	}
}
```

**Short Video**
Only receiving messages can have this message type.
```
{
	contentType: 'wechat/shortvideo',
	content: {
		mediaId: 'MEDIA ID OF SHORT VIDEO',
		thumbMediaId: 'MEDIA ID OF THUMB'
	}
}
```

**Link**
```
{
	contentType: 'wechat/link',
	content: {
		title: 'TITLE',
		description: 'DESC',
		url: 'LINK URL'
	}
}
```

**Location**
```
{
	contentType: 'wechat/location',
	content: {
		locationX: 'LOCATIONX',
		locationY: 'LOCATIONY',
		scale: 'SCALE',
		label: 'LABEL'
	}
}
```

## Example
An example is located at tests directory. Using following command to run it.

```
npm test
```

## Thanks

This package is greatly inspired by [botbuilder-wechat](https://github.com/markusf/botbuilder-wechat), so thanks @markusf.

## Issues

Please feel free to open issues, if you have any suggestion.

## License

The MIT license
