// Created by WaterNode: emerytgriffith@gmail.com

var managementOdrs = "355549692047654913";
var server = "322143718805209090";
var commissions = "338473238545825805";
var ceo = "322160582746963968";
var bots = "357328474874183680";
var discord = require('discord.js');
var client = new discord.Client();
var settings = require('./settings.json');
var currentId = 0;

function bizClient(user) {
    this.user = user;
    this.tag = user.tag;
    this.state = 0;
    this.id = numbers(currentId);
    this.reactMessage = "";
    currentId++;
    if(currentId>9999) {
        currentId = 0;
    }
}

var bizClients = [];

client.on('ready', function() {
    client.user.setGame('PM me to order!');
    console.log('Bot is activated, and ready for action: ' + client.user.tag);
});

client.on("guildMemberAdd", function(member) {
    if (member.user.bot) { return; }
    makeClient(member.user);
});

function makeClient(user) {
    if(!bizClientRetrival(user)) {
        bizClients.push(new bizClient(user));
        user.send("Welcome to PrimeTechnology Discord, " + user + "!\n" +
            "I'm the OrderBot! If you want a quote from us or " +
            "want to purchase from us, please reply back to this message!");
    }
}

function bizClientRetrival(user) {
    leng = bizClients.length;
    for (var i = 0; i < leng; i++) {
        if (bizClients[i].user == user) {
            return bizClients[i];
        }
    }
    return null;
}

function bizClientFromIdRetrival(id) {
    leng = bizClients.length;
    for (var i = 0; i < leng; i++) {
        if (bizClients[i].id == id) {
            return bizClients[i];
        }
    }
    return null;
}

function numbers(id) {
    if(id < 10) {
        return "000" + id;
    } else if(id < 100) {
        return "00" + id;
    } else if(id < 1000) {
        return "0" + id;
    } else {
        return id.toString();
    }
}

var prefix = "!";

/*
function removeMessage(id, channel) {
    channel.fetchMessages().then(function(promise, reject) {
        var messages = promise.values();
        console.log(0);
        for(var i = 0; i < messages.length; i++) {
            var message = messages.next().value;
            console.log(1);
            if(message.content.search(id) > -1) {
                message.delete();
                console.log(2);
            }
        }
    });
}*/

function removeClient(object, list) {
    for(var i = 0; i < list.length; i++) {
        if(list[i] == object) {
            list.splice(i, i+1);
            return;
        }
    }
}

client.on('message', function (message) {

    if (message.author.bot) { return; }

    var type = message.channel.type;
    if(type == "dm") {
        biz = bizClientRetrival(message.author);
        if(biz) {
            switch(biz.state) {
                case 0:
                    biz.user.send("Alright, I see you want to purchase! Great! This is a super " +
                        "simple process to get you a quote as soon as possible, in an " +
                        "automated fashion. Could you describe what exactly you want? " +
                        "Please note - the more details, the more precise quote we can give you.");
                    biz.state++;
                    break;
                case 1:
                    biz.description = message.content;
                    client.channels.get(managementOdrs).send("What the client wants: " + biz.description + '\n'
                        + "Order ID: " + biz.id);
                    biz.user.send("Alright, thanks for the description.\n" +
                        "I will notify the staff to give you a quote.");
                    biz.user.send("What is the name of the Sales Rep who referred you to Prime? If no one did, put N/A");
                    biz.state++;
                    break;
                case 2:
                    biz.rep = message.content;
                    biz.state++;
                    break;
            }
        } else {
            makeClient(message.author);
        }
    } else if(type == "text") {
        if(message.channel.id == managementOdrs) {
            if(message.content.startsWith(prefix)) {
                var command = message.content.slice(prefix.length).split(" ");
                if(command[0].toLowerCase() == "accept") {
                    biz = bizClientFromIdRetrival(command[1]);
                    if(command[1]) {
                        command[2] = parseInt(command[2]);
                        if(command[2]) {
                            if(biz.price) {
                                if(command[2] < biz.price) {
                                    biz.price = command[2];
                                    biz.reacted = message.author;
                                    biz.reactMessage = biz.reacted.tag + " is willing to take this commission on for $" + biz.price + ".\n"
                                        + "If that price is good, react with :white_check_mark:. If it's too high, please feel free to wait for another quote."
                                    biz.user.send(biz.reactMessage).then(function(promise, reject) {
                                        promise.react("✅");
                                    });
                                }
                            } else {
                                biz.price = command[2];
                                biz.reacted = message.author;
                                biz.reactMessage = biz.reacted.tag + " is willing to take this commission on for $" + biz.price + ".\n"
                                    + "If that price is good, react with :white_check_mark:. If it's too high, please feel free to wait for another quote."
                                biz.user.send(biz.reactMessage).then(function(promise, reject) {
                                    promise.react("✅");
                                });
                            }
                        } else {
                            message.author.send("Suggested quote must be a number, " + message.author);
                        }
                    } else {
                        message.author.send("Please enter a valid id, " + message.author);
                    }
                }
                message.delete(1);
            }
        }
    }
});

client.on("messageReactionAdd", function(messageReaction, user) {
    if(messageReaction.emoji.identifier == "%E2%9C%85") {
        biz = bizClientRetrival(user);
        if(biz) {
            if(messageReaction.message.content == biz.reactMessage) {
                var serv = client.guilds.get(server);
                serv.createChannel('commission' + biz.id, "text").then(function(promise, reject) {
                    promise.overwritePermissions(serv.defaultRole, { 'SEND_MESSAGES' : false, 'ATTACH_FILES': false, 'READ_MESSAGES': false });
                    promise.overwritePermissions(biz.reacted, { 'SEND_MESSAGES' : true, 'ATTACH_FILES': true, 'READ_MESSAGES': true });
                    var roles = serv.roles;

                    promise.overwritePermissions(roles.get(ceo), { 'SEND_MESSAGES' : true, 'ATTACH_FILES': true, 'READ_MESSAGES': true }); // CEO
                    promise.overwritePermissions(roles.get(bots), { 'SEND_MESSAGES' : true, 'ATTACH_FILES': true, 'READ_MESSAGES': true }); // BOTS
                    promise.overwritePermissions(biz.user, { 'SEND_MESSAGES' : true, 'ATTACH_FILES': true, 'READ_MESSAGES': true });
                    promise.send("Hey " + biz.user + ", " + biz.reacted + " will be taking on the commission for you, for $" + biz.price + "!\n" +
                        "Please take a few minutes to discuss all the details, and " + serv.members.get("285129010155880449").user + " will collect payment " +
                        "when ready.");
                    client.channels.get(commissions).send("Order ID: " + biz.id + "\n" +
                        "Client: " + biz.tag + " \n" +
                        "Commission Taker: " + biz.reacted.tag + "\n" +
                        "Price: $" + biz.price + "\n" +
                        "Description: " + biz.description + "\n" +
                        "Sales Rep: " + biz.rep + "\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                });
                biz.user.send("Thanks for ordering! I'll add you into a chat to discuss with the CEO and your servicer. Message me again if you'd like to order again.");
                if(biz.state == 2) {
                    biz.rep = "N/A";
                }
                biz.state = 0;
                removeClient(biz, bizClients);
            }
        }
    }
});

client.login(settings.token);
