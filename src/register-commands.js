require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'islive',
        description: 'Check if channel is live',
        options: [
            {
                name: 'channel-id',
                description: 'ID of the channel',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
];

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering slash commands");

        await rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID, 
            process.env.GUILD_ID
         ),
         { body: commands}
        );

        console.log('Slash commands registered');
    } catch (error){
        console.log('big errors: ' + error);
    }
})();