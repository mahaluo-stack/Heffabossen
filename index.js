
const dotenv = require('dotenv');
const { Client, Intents, MessageEmbed } = require('discord.js');

dotenv.config();
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

const WOODHOUSE = process.env.WOODHOUSE;
const TEST_CHANNEL = process.env.TEST_CHANNEL;

client.on('ready', () => {
    console.log('ready');
});

client.login(WOODHOUSE);