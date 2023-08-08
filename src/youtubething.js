require('dotenv').config();
const { Client, IntentsBitField, TextChannel} = require('discord.js');
const axios = require('axios');

const client = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

const PREFIX = '!';
//const DISCORD_CHANNEL_ID = "1138092361491169401";
const announcedLivestreams = new Set();
let youtubeInterval;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "ytnotifications") {
      console.log(interaction)
      if (interaction.options.get('truefalse').value == true){
        if (interaction.options.get('channel-id') == null) {
          interaction.reply("'ChannelID' Required to turn on notifications!")
          return;
        };
        interaction.reply("Notifications turned on")
        youtubeInterval = setInterval(async () => {
          checkYoutube(true, interaction.options.get('channel-id').value, interaction.channel)
          checkYoutube(false, interaction.options.get('channel-id').value, interaction.channel)
        }, 6000);
      } else if (interaction.options.get('truefalse').value == false) {
        if (youtubeInterval) {
          interaction.reply("Notifications turned off")
          clearInterval(youtubeInterval);
          youtubeInterval = null; // Reset the interval ID
        } else {
          interaction.reply("Notifications already turned off!")
        }
      };
    };



  if (interaction.commandName === "islive") {
  console.log("Channelid: " + interaction.options.get('channel-id').value)
      try {
          const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
              params: {
              part: 'snippet',
              channelId: interaction.options.get('channel-id').value,
              type: 'video',
              eventType: 'live',
              key: process.env.YOUTUBE_API,
              },
          });
      
      if (response.data.items.length > 0) {
          const liveStream = response.data.items[0];
          const videoTitle = liveStream.snippet.title;
          const channelTite = liveStream.snippet.channelTitle;
          const liveUrl = `https://www.youtube.com/watch?v=${liveStream.id.videoId}`;
          interaction.reply(`@everyone` + `The channel is live! Title: ${videoTitle}\nWatch here: ${liveUrl}`);
      } else {
          interaction.reply('The channel is not currently live.');
      }
      } catch (error) {
          interaction.reply("Error: " + error);

      }
  };
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  console.log("args: " + args)
  const command = args.shift().toLowerCase();
  console.log("command: " + command)

  if (command === 'islive') {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
              part: 'snippet',
              channelId: process.env.CHANNEL_ID,
              type: 'video',
              eventType: 'live',
              key: process.env.YOUTUBE_API,
            },
          });
      
      if (response.data.items.length > 0) {
        const liveStream = response.data.items[0];
        const videoTitle = liveStream.snippet.title;
        const liveUrl = `https://www.youtube.com/watch?v=${liveStream.id.videoId}`;
        message.channel.send(`The channel is live! Title: ${videoTitle}\nWatch here: ${liveUrl}`);
      } else {
        message.channel.send('The channel is not currently live.');
      }
    } catch (error) {
     message.reply("Error: " + error);

    }
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  console.log("test")
  console.log(oldMember)
  if (newMember.nickname !== oldMember.nickname) {
  targetChannel.send(oldMember.user.username + ", changed their nickname from: '" + oldMember.nickname + "' To: '" + newMember.nickname + "'")
  }
});

client.login(process.env.TOKEN);

async function checkYoutube(Live, ChannelID, targetChannel) {
  console.log("Checking Youtube API")
  var targetChannel = ""
  if (Live) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          channelId: ChannelID,
          type: 'video',
          eventType: 'live',
          key: process.env.YOUTUBE_API,
        },
      });
      if (!targetChannel || !(targetChannel instanceof TextChannel)) {
        console.error('Invalid livestream channel.');
        return;
      }
      if (response.data.items.length > 0) {
        const livestream = response.data.items[0];
        const videoId = livestream.id.videoId;
        const channelTitle = livestream.snippet.channelTitle;
        if (!announcedLivestreams.has(videoId)) {
          announcedLivestreams.add(videoId);
          const videoTitle = livestream.snippet.title;
          const liveUrl = `https://www.youtube.com/watch?v=${videoId}`;
          console.log("Found livestream '" + videoTitle + "'");
          targetChannel.send(`Hey ` + `@everyone` + ` **${channelTitle}** just went live! Come hangout!\n${videoTitle}\n${liveUrl}`);
        } else {
          console.error("Livestream videoId '" + videoId + "' already exists inside of announcedLivestreams");
        }
      }
    } catch (error) {
      console.error('An error occurred while fetching data:', error);
    }
  } else if (!Live) {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          channelId: ChannelID,
          type: 'video',
          order: 'date',
          key: process.env.YOUTUBE_API,
        },
      });
      const targetChannel = client.channels.cache.get(DISCORD_CHANNEL_ID);
      if (!targetChannel || !(targetChannel instanceof TextChannel)) {
        console.error('Invalid target channel.');
        return;
      }
      if (response.data.items.length > 0) {
        const video = response.data.items[0];
        const videoId = video.id.videoId;
        const channelTitle = video.snippet.channelTitle;

        if (!announcedLivestreams.has(videoId)) {
          announcedLivestreams.add(videoId);
          const videoTitle = video.snippet.title;
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          console.log("Found video '" + videoTitle + "'");
          targetChannel.send(`Hey ` + `@everyone` + ` **${channelTitle}** just uploaded a new video!\n${videoTitle}\nCheck it out here:${videoUrl}`);
        } else {
          console.error("Video videoId '" + videoId + "' already exists inside of announcedLivestreams")
        }
      }
    } catch (error) {
    console.error('An error occurred while fetching data:', error);
    }
  }
}