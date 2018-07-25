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
const commands = ['STRAIGHT', 'LEFT', 'RIGHT', 'BACK', 'STOP', 'CONNECT', 'DISCONNECT'];

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
  if(commands.indexOf(session.message.text) > -1 ) {
    //some valid command chosen
    var msg = new builder.Message(session)
      .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          speak: `<s>Your  meeting about \"You chose the command: ${session.message.text}\"<break strength='weak'/> Change the command to some of the following:</s>`,
          body: [
            {
              "type": "TextBlock",
              "text": "Welcome to the RoboTeams boot.",
              "size": "large",
              "weight": "bolder"
            },
            {
              "type": "TextBlock",
              "text": "Please type the name of your bluetooth device"
            },
            {
              "type": "Input.Text",
              "id": "name",
              "style":"compact",
            }
          ],
          "actions": [
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "STRAIGHT"
            },
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "LEFT"
            },
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "RIGHT"
            },
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "BACK"
            },
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "STOP"
            },
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "DISCONNECT"
            },
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "CONNECT"
            }
          ]
        }
      });
  } else {
    var msg = new builder.Message(session)
      .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          speak: "<s>Your  meeting about \"Welcome to the RoboTeams boot.\"<break strength='weak'/> Enter the name of your bluetooth device: </s>",
          body: [
            {
              "type": "TextBlock",
              "text": "Welcome to the RoboTeams boot.",
              "size": "large",
              "weight": "bolder"
            },
            {
              "type": "TextBlock",
              "text": "Please type the name of your bluetooth device"
            },
            {
              "type": "Input.Text",
              "id": "name",
              "style":"compact",
            }
          ],
          "actions": [
            {
              "type": "Action.OpenUrl",
              "method": "POST",
              "url": "http://foo.com",
              "title": "Send"
            },
          ]
        }
      });
  }

  session.send(msg);
});
// Order dinner.
bot.dialog('orderDinner', [
  //...waterfall steps...
])
// Once triggered, will start the 'showDinnerCart' dialog.
// Then, the waterfall will resumed from the step that was interrupted.
  .beginDialogAction('showCartAction', 'showDinnerCart', {
    matches: /^show cart$/i,
    dialogArgs: {
      showTotal: true
    }
  });

// Show dinner items in cart with the option to show total or not.
bot.dialog('showDinnerCart', function (session, args) {
  for (var i = 1; i < session.conversationData.orders.length; i++) {
    session.send(`You ordered: ${session.conversationData.orders[i].Description} for a total of $${session.conversationData.orders[i].Price}.`);
  }

  if (args && args.showTotal) {
    // End this dialog with total.
    session.endDialog(`Your total is: $${session.conversationData.orders[0].Price}`);
  }
  else {
    session.endDialog(); // Ends without a message.
  }
});