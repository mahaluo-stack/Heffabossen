const WOODHOUSE = process.env.WOODHOUSE;
const TEST_CHANNEL = process.env.TEST_CHANNEL;
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('ready');
});

client.login(WOODHOUSE);