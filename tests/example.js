var restify   = require('restify'),
    builder   = require('botbuilder'),
    connector = require('../WechatConnector');

// Create wechat connector
var wechatConnector = new connector.WechatConnector({
    appID: "YOUR WECHAT APP ID",
    appSecret: "YOUR WECHAT APP SECRET",
    appToken: "YOUR WECHAT TOKEN"
});

var bot = new builder.UniversalBot(wechatConnector);

// Bot dialogs
// Todo..

// Create http server
var server = restify.createServer();

server.use(wechatConnector.listen());

server.get('/', function(req, res) {
    res.send(200, 'Hello Bot');
});

// Start listen on port
server.listen(process.env.port || 9090, function () {
    console.log('%s listening to %s ...', server.name, server.url);
});
