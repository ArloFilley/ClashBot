const { SlashCommandBuilder } = require('discord.js');
const { CLASH_TOKEN, CLAN_TAG } = require('../../config/config.json');
const { Roles } = require('../../config/config.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clashtag')
        .addStringOption(option => option.setName('clashtag')
            .setDescription('Your Clash Tag')
            .setRequired(true),
        )
        .addUserOption(option => option.setName('user')
            .setDescription('user who\'s account it is')
        )
        .setDescription('Awesome Sauce!'),

    async execute(interaction) {
        const memberRole = await interaction.guild.roles.fetch(Roles.MemberRoleID);
        const elderRole = await interaction.guild.roles.fetch(Roles.ElderRoleID);
        const coLeaderRole = await interaction.guild.roles.fetch(Roles.CoLeaderRoleID);
        const leaderRole = await interaction.guild.roles.fetch(Roles.LeaderRoleID);

        let userID = interaction.user.id;

        if (interaction.options.getUser('user')) {
            userID = interaction.options.getUser('user').id;
        }

        const clanTagRegex = /^#([A-Z0-9]{3,10})$/;

        let tag = interaction.options.getString('clashtag');
        let isValidClanTag = clanTagRegex.test(tag);

        if (!isValidClanTag) {
            await interaction.reply(`${tag} is not a valid Clash Tag`);
            return;
        }

        const cocclient = require('clash-of-clans-node');
        await cocclient.login(CLASH_TOKEN, "Coc client logged in");

        try {
            const player = await cocclient.getPlayer(tag);
            if (!player.tag) {
                await interaction.reply(`${tag} is not a valid Clash Tag`);
                return;
            }

            console.log(`${player.tag} is a valid Clash Tag`);

            const clan = await cocclient.getClan(CLAN_TAG);
            console.log(`${userID} -> ${player.tag}`);

            const guildMember = await interaction.guild.members.fetch(userID);

            // Update user nickname
            if (guildMember.user.id !== '674317125602508801') {
                await guildMember.setNickname(`${player.name} - ${player.tag}`);
            }

            // Read existing user data
            const userData = fs.readFileSync('./data/users.json', 'utf8');
            let users = [];
            if (userData) {
                users = JSON.parse(userData);
            }

            let existingUser = false;
            // Check if the user already exists
            for (const user of users.users) {
                if (user.discordId === userID) {
                    existingUser = true;
                    if (!user.clashTags.includes(player.tag)) {
                        // Add the Clash Tag and username to the existing user
                        user.clashTags.push(player.tag);
                        user.clashUsernames.push(player.name);
    
                        // Write updated user data
                        fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
                    }
                }
            }
           
            if (!existingUser) {
                // Add user info to the array if the user does not exist
                const userInfo = {
                    clashTags: [player.tag],
                    clashUsernames: [player.name],
                    discordId: userID,
                };
                users.users.push(userInfo);

                // Write updated user data
                fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
            }

            // Role assignment based on the player's role in the clan
            switch (player.role) {
                case 'leader':
                    guildMember.roles.add(leaderRole);
                    await interaction.reply(`Welcome Leader ${player.name} - ${player.tag}`);
                    break;
                case 'coLeader':
                    await interaction.reply(`Welcome Co-Leader ${player.name} - ${player.tag}`);
                    guildMember.roles.add(coLeaderRole);
                    return;
                case 'admin':
                    guildMember.roles.add(elderRole);
                    await interaction.reply(`Welcome Elder ${player.name} - ${player.tag}`);
                    break;
                default:
                    guildMember.roles.add(memberRole);
                    await interaction.reply(`Welcome Member ${player.name} - ${player.tag}`);
                    break;
            }

            
        } catch (error) {
            console.error('Error:', error);
            await interaction.reply(`An error occurred while processing the Clash Tag.`);
        }
    },
};

