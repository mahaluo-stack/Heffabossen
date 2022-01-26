
const timeReg = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const today = new Date();

const emojis = require('./emojis');
const bosslist = require('./bosslist');

module.exports = {
    verify: async function (message) {

        let member = message.guild.members.cache.get(message.author.id);
        let nickname = member.displayName;

        try {
            return formatMessage(message, nickname);
        } catch (error) {
            return error;
        }

        function formatMessage(message, nickname) {

            let split = message.content.split(' ');
            let time, date, boss;

            bosslist.forEach((item) => {
                if (message.content.includes(item.key)) {
                    boss = item;
                }
            });

            split.forEach((word) => {
                let noBold = word.replace(/\*/g, '');
                let numbers = noBold.match(/\d+/g);
                if (numbers != null) {
                    if (noBold.includes('/')) date = noBold;
                    if (noBold.includes(':')) time = noBold;
                }
            });

            if (!boss) {
                throw 'ERROR: bad keyword';
            }
            else if (!time || !time.match(timeReg).length > 0) {
                throw 'ERROR: bad time format';
            }
            else if (!date) {
                throw 'ERROR: bad date format';
            }
            else {
                try {

                    checkDate(date, time);

                    let blockers = '';
                    let healers = '';
                    let free = '';

                    for (let i = 0; i < boss['blockers']; i++) { blockers = blockers + 'blocker: \n' }
                    for (let i = 0; i < boss['healers']; i++) { healers = healers + 'healer: \n' }
                    for (let i = 0; i < boss['free']; i++) { free = free + 'free: \n' }

                    boss =
                        '**' + nickname + '** is doing: **' + boss['name'] + '** on: **' + date + '** at: **' + time + '** \n'
                        + blockers
                        + healers
                        + free;

                    return boss;

                } catch (error) {
                    throw 'ERROR: ' + error;
                }
            }
        }
        function checkDate(date) {

            let split = date.split('/');
            let fullDate = new Date(today.getFullYear().toString() + '-' + split[1] + '-' + split[0]);

            if (fullDate >= today) {
                return true;
            }
            else {
                throw 'bad time or date';
            }
        }
    },
    handleReaction: async function (add, reaction, user) {

        let messageRows = reaction.message.content.split('\n');
        let firstRow = messageRows.shift() + '\n';
        let member = reaction.message.guild.members.cache.get(user.id);
        let nickname = member.displayName;
        let emoji = reaction.emoji.name;
        
        if (validEmoji()) {
            if (validName()) {
                try {
                    return firstRow + editList();
                } catch (error) {
                    return error;
                }
            }
            else {
                return 'ERROR: multiple reacts from same user'
            }
        }
        else {
            return 'ERROR: invalid emoji';
        }

        function validEmoji() {
            switch (emoji) {
                case emojis['knight']['emoji']:
                case emojis['druid']['emoji']:
                case emojis['sorcerer']['emoji']:
                case emojis['paladin']['emoji']:
                    return true;
                default:
                    return false;
            }
        }

        function validName() {
            if (messageRows.toString().includes(nickname) && add) {
                return false;
            }
            else {
                return true;
            }
        }

        function editList() {
            if (add) {
                try {
                    let flag = false;
                    for (let i = 0; i < messageRows.length; i++) {
                        if (messageRows[i].length <= 10 && !flag) {
                            if (messageRows[i].includes('blocker') && emoji === emojis.knight.emoji) {
                                messageRows[i] = messageRows[i] + ' ' + nickname + ' ' + emoji + '\n';
                                flag = true;
                            }
                            else if (messageRows[i].includes('healer') && emoji === emojis.druid.emoji) {
                                messageRows[i] = messageRows[i] + ' ' + nickname + ' ' + emoji + '\n';
                                flag = true;
                            }
                            else if (messageRows[i].includes('free') && !flag) {
                                messageRows[i] = messageRows[i] + ' ' + nickname + ' ' + emoji + '\n';
                                flag = true;
                            }
                            else {
                                messageRows[i] = messageRows[i] + '\n';
                            }
                        }
                        else {
                            messageRows[i] = messageRows[i] + '\n';
                        }
                    }
                    
                    if (!flag) {
                        throw 'ERROR: no free slots';
                    }
                    else {
                        return messageRows.toString().split(',').join('');
                    }
                   
                } catch (error) {
                    return error;
                }
            }
            else {
                try {
                    for (let i = 0; i < messageRows.length; i++) {
                        if (messageRows[i].includes(nickname)) {
                            if (messageRows[i].includes('blocker')) {
                                messageRows[i] = 'blocker: \n';
                            }
                            else if (messageRows[i].includes('healer')) {
                                messageRows[i] = 'healer: \n';
                            }
                            else {
                                messageRows[i] = 'free: \n';
                            }
                        }
                        else {
                            messageRows[i] = messageRows[i] + '\n';
                        }
                    }
                    return messageRows.toString().split(',').join('');
                } catch (error) {
                    return error;
                }
            }
        }
    }
}

