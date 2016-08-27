var restify  = require('restify'),
    builder  = require('botbuilder'),
    wechatConnector = require('../WechatConnector');

var bot, connector, server;

// Create wechat connector
connector = new wechatConnector({
    appID: "YOUR WECHAT APP ID",
    appSecret: "YOUR WECHAT APP SECRET",
    appToken: "YOUR WECHAT TOKEN"
});

bot = new builder.UniversalBot(connector);

// Bot dialogs
// Todo..

// Create http server
server = restify.createServer();

server.use(connector.listen());

server.get('/', function(req, res) {
    res.send(200, 'Hello Bot');
});

// Start listen on port
server.listen(process.env.port || 9090, function () {
    console.log('%s listening to %s ...', server.name, server.url);
});
