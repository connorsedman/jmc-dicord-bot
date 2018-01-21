const ytdl = require("ytdl-core");
const request = require("request");
const fs = require("fs");
const getYouTubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const Discord = require('discord.js');
const client = new Discord.Client({disableEveryone: true});
var config = JSON.parse(fs.readFileSync('./botconfig.json', 'utf-8'));
const token = config.token;
const game = config.game;
const prefix = config.prefix;
const yt_api_key = config.yt_api_key;
const bot_constroller = config.bot_controller;
var guilds = {};
client.login(token);
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find('name', 'member-log');
  if (!channel) return;
  channel.send(`Welcome to the server, ${member}`);
});
client.on('message', function(message) {
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(" ");
    if (guilds[message.guild.id] == null) {
        guilds[message.guild.id] = {
            queue: [],
            queueNames: [],
            isPlaying: false,
            dispatcher: null,
            voiceChannel: null,
            skipReq: 0,
            skippers: []
        };
    }
	if (mess.startsWith(prefix + "serverinfo")){
	  let sicon = message.guild.avatarURL;
	  let serverembed = new Discord.RichEmbed()
	  .setDescription("Server info")
	  .setColor("#15f153")
	  .setThumbnail(sicon)
	  .addField("Server Name" , message.guild.name)
	  .addField("Created On" , message.guild.createdAt)
	  .addField("You Joined", member.joinedAt)
	  .addField("Users", message.guild.memberCount)
	  .addField("Your Role" , member.highestRole)
	  .addField("Owner", message.guild.owner)
	  .addField("Onwer ID", message.guild.ownerID);
	  return message.channel.send(serverembed);
  }
  if (mess.startsWith(prefix + "botinfo")){
	  let bicon = bot.user.displayavatarURL;
	  let botembed = new Discord.RichEmbed()
	  .setDescription("Bot Info")
	  .setColor("#15f153")
	  .setThumbnail(bicon)
	  .addField("Bot ID", bot.user.id)
	  .addField("Name on Server", bot.user.username)
	  .addField("Bot Name", bot.user.tag )
	  .addField("Created At", bot.user.createdAt);
	  return message.channel.send(botembed);
  }
  if (mess.startsWith(prefix + "help")){
	  let dmembed = new Discord.RichEmbed()
	  .setDescription("Help Info")
	  .setColor("#15f153")
	  .addField("**!play [song name]**","Playes a song of your chose on the voice channel you are in")
	  .addField("**!serverinfo**","Tells you info about the server")
	  .addField("**!botinfo**","Tells you the bot info")
	  
	  return message.author.send(dmembed);
  }
  if(mess.startsWith(prefix + "report")){
    //!report @sedspvp this is the reason
    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!rUser) return message.channel.send("Couldn't find user.");
    let rreason = args.slice(22);
    let reportEmbed = new Discord.RichEmbed()
    .setDescription("Reports")
    .setColor("#15f153")
    .addField("Reported User", `${rUser} with ID: ${rUser.id}`)
    .addField("Reported By", `${message.author} with ID: ${message.author.id}`)
    .addField("Channel", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", rreason);
    let reportschannel = message.guild.channels.find(`name`, "reports");
    if(!reportschannel) return message.channel.send("Couldn't find reports channel.");
    message.delete().catch(O_o=>{});
    reportschannel.send(reportEmbed);
	let UserReportEmbed = new Discord.RichEmbed()
	.setDescription("You have been reported")
	.setColor("#bc0000")
	.addField("Reported By", `${message.author} with ID: ${message.author.id}`)
    .addField("Time", message.createdAt)
    .addField("Reason", rreason);
    return message.author.send(UserReportEmbed);
  }
  if (mess.startsWith(prefix + "kick")){
    //!kick @daeshan askin for it
    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!kUser) return message.channel.send("Can't find user!");
    let kReason = args.slice(22);
    if(!member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("No can do pal!");
    if(kUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("That person can't be kicked!");
    let kickEmbed = new Discord.RichEmbed()
    .setDescription("~Kick~")
    .setColor("#e56b00")
    .addField("Kicked User", `${kUser} with ID ${kUser.id}`)
    .addField("Kicked By", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Kicked In", message.channel)
    .addField("Tiime", message.createdAt)
    .addField("Reason", kReason);
    let kickChannel = message.guild.channels.find(`name`, "incidents");
    if(!kickChannel) return message.channel.send("Can't find incidents channel.");
    message.guild.member(kUser).kick(kReason);
    kickChannel.send(kickEmbed);
    return;
  }
  if(mess.startsWith(prefix + "ban")){
    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return message.channel.send("Can't find user!");
    let bReason = args.slice(22);
    if(!member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("No can do pal!");
    if(bUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send("That person can't be baned!");
    let banEmbed = new Discord.RichEmbed()
    .setDescription("~Ban~")
    .setColor("#bc0000")
    .addField("Banned User", `${bUser} with ID ${bUser.id}`)
    .addField("Banned By", `<@${message.author.id}> with ID ${message.author.id}`)
    .addField("Banned In", message.channel)
    .addField("Time", message.createdAt)
    .addField("Reason", bReason);
    let incidentchannel = message.guild.channels.find(`name`, "incidents");
    if(!incidentchannel) return message.channel.send("Can't find incidents channel.");
    message.guild.member(bUser).ban(bReason);
    incidentchannel.send(banEmbed);
    return;
  }
    if (mess.startsWith(prefix + "play")) {
        if (message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null) {
            if (guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
                getID(args, function(id) {
                    add_to_queue(id, message);
                    fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        message.reply(" added to queue: **" + videoInfo.title + "**");
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                    });
                });
            } else {
                isPlaying = true;
                getID(args, function(id) {
                    guilds[message.guild.id].queue.push(id);
                    playMusic(id, message);
                    fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                        message.reply(" now playing: **" + videoInfo.title + "**");
                    });
                });
            }
        } else {
            message.reply(" you need to be in a voice channel!");
        }
    } if (mess.startsWith(prefix + "skip")) {
        if (guilds[message.guild.id].skippers.indexOf(message.author.id) === -1) {
            guilds[message.guild.id].skippsers.push(message.author.id);
            guilds[message.guild.id].skipReq++;
            if (guilds[message.guild.id].skipReq >= Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2)) {
                skip_song(message);
                message.reply(" your skip has been acknowledged. Skipping now!");
            } else {
                message.reply(" your skip has been acknowledged. You need **" + Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2) - guilds[message.guild.id].skipReq) = "**  more skip votes!";
            }
        } else {
            message.reply(" you already voted to skip!");
        }
    } if (mess.startsWith(prefix + "queue")) {
        var message2 = "```";
        for (var i = 0; i < guilds[message.guild.id].queueNames.length; i++) {
            var temp = (i + 1) + ": " + guilds[message.guild.id].queueNames[i] + (i === 0 ? " **(Current Song)** " : "") + "\n";
            if ((message2 + temp).length <= 2000 - 3) {
                message2 += temp;
            } else {
                message2 += "```";
                message.channel.send(message2);
                message2 = "```";
            }
        }
        message2 += "```";
        message.channel.send(message2);
    } if (mess.startsWith(prefix + "vmove")){
		let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
		if(!user) return message.reply("Can't find user");
		if(!member.hasPermission("MOVE_MEMBERS")) return message.reply("no can do pal");
		if(user.hasPermission("MOVE_MEMBERS")) return message.reply("user can not be moved");
		let Channel = args.slice(22);
		let channel = message.guild.channels.find(`name`, `${Channel}`);
		if(!channel) return message.reply(`${Channel} not found`);
		let type = channel.type;
		if(type === `voice`){
		if(!user.voiceChannel){ 
		return message.reply(`${user} is not in a voice channel`);
		}else{
		message.guild.member(user).setVoiceChannel(channel);
		}
		}else{ 
		return message.reply(`${channel} is not a voice channel`);
		}
	}
});
client.on('ready', function() {
    console.log("I am ready!");
	client.user.setActivity(`${game}`, {type: "PLAYING"});
});
function skip_song(message) {
    guilds[message.guild.id].dispatcher.end();
}
function playMusic(id, message) {
    guilds[message.guild.id].voiceChannel = message.member.voiceChannel;
    guilds[message.guild.id].voiceChannel.join().then(function(connection) {
        stream = ytdl("https://www.youtube.com/watch?v=" + id, {
            filter: 'audioonly'
        });
        guilds[message.guild.id].skispReq = 0;
        guilds[message.guild.id].skippers = [];
        guilds[message.guild.id].dispatcher = connection.playStream(stream);
        guilds[message.guild.id].dispatcher.on('end', function() {
            guilds[message.guild.id].skipReq = 0;
            guilds[message.guild.id].skippers = [];
            guilds[message.guild.id].queue.shift();
            guilds[message.guild.id].queueNames.shift();
            if (guilds[message.guild.id].queue.length === 0) {
                guilds[message.guild.id].queue = [];
                guilds[message.guild.id].queueNames = [];
                guilds[message.guild.id].isfPlaying = false;
				guilds[message.guild.id].voiceChannel.leave();
            } else {
                setTimeout(function() {
                    playMusic(guilds[message.guild.id].queue[0], message);
                }, 500);
            }
        });
    });
}
function getID(str, cb) {
    if (isYoutube(str)) {
        cb(getYouTubeID(str));
    } else {
        search_video(str, function(id) {
            cb(id);
        });
    }
}
function add_to_queue(strID, message) {
    if (isYoutube(strID)) {
        guilds[message.guild.id].queue.push(getYouTubeID(strID));
    } else {
        guilds[message.guild.id].queue.push(strID);
    }
}
function search_video(query, callback) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
        var json = JSON.parse(body);
        if (!json.items[0]) callback("3_-a9nVZYjk");
        else {
            callback(json.items[0].id.videoId);
        }
    });
}
function isYoutube(str) {
    return str.toLowerCase().indexOf("youtube.com") > -1;
}
