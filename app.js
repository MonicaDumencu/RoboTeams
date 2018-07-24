var restify = require('restify');
var builder = require('botbuilder');

var Connect = 'Connect';
var Upload = 'Show uploaded attachment';
var External = 'Show Internet attachment';
var Options = [Connect, Upload, External];

var inMemoryStorage = new builder.MemoryBotStorage();

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    if (session.message && session.message.value) {
        processSubmitAction(session, session.message.value);
        return;
	}

	var msg = new builder.Message(session)
    .text("What command would you like to send?")
    .suggestedActions(
        builder.SuggestedActions.create(
                session, [
                    builder.CardAction.imBack(session, "START", "Connect"),
                    builder.CardAction.imBack(session, "FORWARDS", "Move Forwards"),
                    builder.CardAction.imBack(session, "STOP", "Stop")
                ]
            ));
	session.send(msg);

}).set('storage', inMemoryStorage); // Register in memory storage

bot.dialog('connect-car', require('./connect-car'));

// log any bot errors into the console
bot.on('error', function (e) {
    console.log('And error ocurred', e);
});

function processSubmitAction(session, value) {
    var defaultErrorMessage = 'Not a command';
    switch (value.type) {
        case 'connect':
            session.send('Roboteams: connect');
            break;

        default:
            // A form data was received, invalid or incomplete since the previous validation did not pass
            session.send(defaultErrorMessage);
    }
}
