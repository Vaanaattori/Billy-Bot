require('dotenv').config();

const { Client, IntentsBitField} = require('discord.js');

const client = new Client ({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', (c) => {
    console.log('Hello World!😎')
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName == "cheese") {
        console.log(interaction.user.bot)
        if (!interaction.user.bot) {
            interaction.reply("youre *not* a bot 😀")
        }
    }
});

client.on('messageCreate', (message) => {   
    if (message.author.bot) return;
//    message.reply(message.content)
});

client.login(process.env.TOKEN);

