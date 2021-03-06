const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

const emojis = require('./asset/emojis');
const bosslist = require('./asset/bosslist');
const listHandler = require('./asset/listhandler');

client.destroy();
client.login(process.env.TOKEN);
const CHANNEL = process.env.CHANNEL;

client.on('ready', () => {

    try {
 
        console.log(`${client.user.tag} has logged in`);
        const channel = client.channels.cache.get(CHANNEL);

        channel.send({ embeds: [welcomeEmbed()] }); 

    } catch (error) { 
        console.log('on ready error');
    }

    function welcomeEmbed() {

        const welcomeEmbed = new MessageEmbed();
    
        welcomeEmbed.setColor('#0099ff');
        welcomeEmbed.setTitle('welcome');
    
        welcomeEmbed.setDescription(
            'to create a list: \n' + 
            'command example: **faceless 22/01 19:30** \n' +
            'note the format for date (day**/**month) and time (19**:**30) \n' +
            'timezone: europe/amsterdam \n' +
            'your message needs to follow this format or it will be ignored \n\n' +
            getBossList() +
            '\n to join a list, react with an emoji based on the role you want \n' + 
            'if a blocker/healer spot is free, first to react will get its respective slot \n' +
            'they should be considered main blocker/healer \n\n\n',
        );
    
        welcomeEmbed.addFields(
            { name: 'knight', value: emojis['knight']['emoji'] + ' dagger' },
            { name: 'druid', value: emojis['druid']['emoji'] + ' apple' },
            { name: 'sorcerer', value: emojis['sorcerer']['emoji'] + ' mage' },
            { name: 'paladin', value: emojis['paladin']['emoji'] + ' bow' },
            { name: '\u200b', value: '\u200b' }
        )
        welcomeEmbed.setFooter('visit: ' + 'https://github.com/mahaluo-stack/Heffabossen', ' ', false);
    
        return welcomeEmbed;
    }
    
    function getBossList() {
     
        let bosskeys = '\n';
    
        let single = '\n **singles**: \n';
        let mini = '\n **minis**: \n';
        let final = '\n **finals**: \n';
        let warzone = '\n **warzones**: \n';
        let hot = '\n **too hot to handle**: \n';
    
        bosslist.forEach((boss) => {
            let item = boss.name + ': ' + '**' + boss.key + '**' + '\n';
            switch (boss.group) {
                case 'single':
                    single = single + item;
                    break;
                case 'mini':
                    mini = mini + item;
                    break;
                case 'final':
                    final = final + item;
                    break;
                case 'warzone': 
                    warzone = warzone + item;
                    break;
                case 'hot':
                    hot = hot + item;
                    break;
                default:
                    break;
            }
        })
    
        bosskeys = single + mini + final + warzone + hot;
        return bosskeys;
    }
});

client.on('messageCreate', (message) => {
  
    if (message.author.bot) return
    else if (message.channel.id === CHANNEL) {

        try {

            listHandler.verify(message).catch((error) => {
                console.error(error);
            })
            .then((res) => {
                
                if (res.includes('ERROR')) {
                    console.log('\n' + res);
                }
                else {
                    console.log('new listing was made: \n', res);
                    message.channel.send(res);
                }
            })
            .finally(() => {
                message.delete();
            })
            
        } catch (error) {
            console.error(error);
            message.delete();
        }
    }
});

client.on('messageReactionAdd', (reaction, user) => {

    if (reaction.message.channel.id === CHANNEL) {

        try {

            listHandler.handleReaction(true, reaction, user)
            .then((res) => {
                if (res.includes('ERROR')) {

                    console.log('\n' + res);
                    reaction.users.remove(user.id);
                }
                else {

                    console.log(res);
                    reaction.message.edit(res);
                }
            })
        } catch (error) {
            console.error(error);
            reaction.users.remove(user.id);
        }
    }
});

client.on('messageReactionRemove', (reaction, user) => {

    if (reaction.message.channel.id === CHANNEL) {

        try {
            listHandler.handleReaction(false, reaction, user)
            .then((res) => {
                if (res.includes('ERROR')) {
                    console.log('\n' + res);
                }
                else {
                    reaction.message.edit(res);
                }
            })
            .finally(() => {
                reaction.users.remove(user.id);
            })
        } catch (error) {
            console.error(error);
            reaction.users.remove(user.id);
        }
    }
});