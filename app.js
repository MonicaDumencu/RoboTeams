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
	

/*var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send('Welcome, here you can see attachment alternatives:');
        builder.Prompts.choice(session, 'What sample option would you like to see?', Options, {
            maxRetries: 3
        });
    },
    function (session, results) {
        var option = results.response ? results.response.entity : Inline;
        switch (option) {
            case Connect:
                return connect();
            case Upload:
                return;
            case External:
                return;
        }
 }]).set('storage', inMemoryStorage); // Register in memory storage
 
 function connect() {
	"use strict";
	var serverName = 'HC-06';	

	var util = require('util');
	var DeviceINQ = require("./node_modules/bluetooth-serial-port/lib/device-inquiry.js").DeviceINQ;
	var BluetoothSerialPort = require("./node_modules/bluetooth-serial-port/lib/bluetooth-serial-port.js").BluetoothSerialPort;
	var serial = new BluetoothSerialPort();
	const MAX_MSGS_SENT = 10;
	var keepScanning = false;

	serial.on('found', function (address, name) {
		console.log('Found: ' + address + ' with name ' + name);

		serial.findSerialPortChannel(address, function(channel) {
			console.log('Found RFCOMM channel for serial port on ' + name + ': ' + channel);

			if (name !== serverName) return;

			console.log('Attempting to connect...');

			serial.connect(address, channel, function() {
		keepScanning  = false;
			let packetsSent = 0;
				console.log('Connected. Sending data...');
				let buf = new Buffer('f');
				console.log('Size of buf = ' + buf.length);

		serial.on('failure', function(err){
			console.log('Something wrong happened!!: err = ' + err);
		});

				serial.on('data', function(buffer) {
					console.log('Received: Size of data buf = ' + buffer.length);
					console.log(buffer.toString('utf-8'));
			serial.write(buf, function(err,count){
						if(err){
							console.log('Error received: ' + err);
				return;
					}
					
			console.log('Sent: Bytes written: ' + count);
			packetsSent++;
			console.log('Sent: count = ' + packetsSent);
			if(packetsSent == MAX_MSGS_SENT){
				console.log('' + MAX_MSGS_SENT + ' sent!. Closing connection');
				serial.close();
				process.exit(0);
			}
			});
				});

				serial.write(buf, function(err, count) {
					if (err) {
						console.log('Error received: ' + err);
					} else {
						console.log('Bytes writen is: ' + count);
					}
				});
			});
		});
	});

	serial.on('close', function() {
		console.log('connection has been closed (remotely?)');
	});

	serial.on('finished', function() {
		console.log('Scan finished.');
	if(keepScanning == true){
		console.log('Rescanning..');
		serial.inquire();
	}
	});

	serial.inquire();
}*/