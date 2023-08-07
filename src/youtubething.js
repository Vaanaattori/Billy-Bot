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
const DISCORD_CHANNEL_ID = "1138092361491169401";
const announcedLivestreams = new Set();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  setInterval(async () => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          channelId: process.env.CHANNEL_ID,
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

        if (video.snippet.eventType === 'live') {
          if (!announcedLivestreams.has(videoId)) {
            announcedLivestreams.add(videoId);

            const videoTitle = video.snippet.title;
            const liveUrl = `https://www.youtube.com/watch?v=${videoId}`;
            targetChannel.send(`Hey ` + `@everyone` + ` **${channelTitle}** just went live! Come hangout!\n${videoTitle}\n${liveUrl}`);
          }
        } else {
          // Handle non-livestream videos
          const videoTitle = video.snippet.title;
          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          targetChannel.send(`Hey ` + `@everyone` + ` **${channelTitle}** just uploaded a new video!\n${videoTitle}\nCheck it out here:${videoUrl}`);
        }
      }
    } catch (error) {
      console.error('An error occurred while fetching data:', error);
    }
  }, 240000);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.commandName === "islive") return;
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

client.login(process.env.TOKEN);
