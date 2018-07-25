let restify = require('restify');
let builder = require('botbuilder');
var azure = require('botbuilder-azure');

var documentDbOptions = {
  host: 'https://roboteams.documents.azure.com:443/',
  masterKey: 'j4ueEYQvlxCBmZyqSZkXpIBnj13W9DdFgpWqnGJo2KUokLYSexXOVBFFUW92b75ip47ahxOmt4b27Mad3wk8pw==',
  database: 'botdocs',
  collection: 'botdata'
};

var docDbClient = new azure.DocumentDbClient(documentDbOptions);
var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

let Connect = 'Connect';
let Upload = 'Show uploaded attachment';
let External = 'Show Internet attachment';
let Options = [Connect, Upload, External];

// Setup Restify Server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

const commands = ['STRAIGHT', 'LEFT', 'RIGHT', 'BACK', 'STOP'];

const State = {
  START: 'START',
  NAME: 'NAME',
  CONNECTED: 'CONNECTED',
};

function printCommands() {
  let result = "";
  for(let i=0; i<commands.length; i++) {
    result += `${commands[i]}\n`;
  }
  return result;
}
let state = State.START;
let name = null;
// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
let bot = new builder.UniversalBot(connector, function (session) {
  const message = session.message.text;
  if (message.indexOf("NAME") > -1) {
    state = State.NAME;
    name = message.substring(6);
    session.send(`You chose the name ${name}. Send the CONNECT command to connect to it.`);
  } else if (state === State.NAME && message !== 'CONNECT') {
    session.send("You must connect the device first! Send CONNECT message!");
  } else if (state === State.NAME && message === 'CONNECT') {
    state = State.CONNECTED;
    session.send(`You chose to connect with the device. Next, choose one of the following commands:\n${printCommands()}`);
  } else if (commands.indexOf(message) > -1 && state === State.CONNECTED) {
    session.send(`You choose the ${message} command.`);
  } else if (state === State.CONNECTED && message === 'DISCONNECT') {
    state = 'start';
    session.send(`Disconnecting from the device: ${name}`);
    name = null;
  } else {
    if(state === State.START) {
      session.send("You must specify the name of the device first. Send message in the following format:\nNAME: HC-06");
    } else if(state === State.CONNECTED) {
      session.send(`Please send one of the supported commands:\n${printCommands()}`);
    } else {
     session.send("Invalid command. \"You must specify the name of the device first")
    }
  }
}).set('storage', cosmosStorage);
