const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CLASH_TOKEN, CLAN_TAG } = require('../../config/config.json');
const { Roles } = require('../../config/config.json');
const fs = require('fs');
const data = require('../../data/users.json')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .addUserOption(option => option.setName('user')
            .setDescription('user who\'s account it is')
            .setRequired(true)
        )
        .setDescription('Awesome Sauce!'),

    async execute(interaction) {
        try {
            let userID = interaction.options.getUser('user').id;
            let discordID = interaction.guild.members.cache.get(userID) || await interaction.guild.members.fetch(userID);

            let embed = new EmbedBuilder()
                    .setTitle(`User - ${discordID.user.globalName}`)
                    .setColor('#00FF00');

            for (let user of data.users) {
                if (user.discordId == userID) {
                    for (let i in user.clashTags) {
                        let j = Number(i) + 1;
                        embed.addFields({ name: `Account ${j}`, value: `${user.clashUsernames[i]} - ${user.clashTags[i]}` })
                    }
                } 
            }

            await interaction.reply({ embeds: [embed] });        
        } catch (error) {
            console.error('Error:', error);
            await interaction.reply(`An error occurred while processing the Clash Tag.`);
        }
    },
};

