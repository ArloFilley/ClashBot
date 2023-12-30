const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readData } = require('../../utils/readData')
const { CLASH_TOKEN, CLAN_TAG } = require('../../config/config.json');
const cocclient = require('clash-of-clans-node')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('outliers')
        .setDescription('Returns users who need to link their accounts, be kicked from the clan, or join the discord!'),

    async execute(interaction) {
        try {
            await cocclient.login(CLASH_TOKEN, "Fetching Data From COC API");
            const members = await cocclient.getClanMembers(CLAN_TAG);

            let embed = new EmbedBuilder()
                .setTitle(`# Outliers`)
                .setColor('#FF0000');

            const data = await readData();
            const tags = Object.keys(data);

            for (let clanMember of members.items) {
                if (!tags.includes(clanMember.tag)) {
                    embed.addFields({ name: `Clan Member ${clanMember.name} - ${clanMember.tag}`, value: `is not registered properley` })
                }
            }

            await interaction.reply({ embeds: [embed] });        
        } catch (error) {
            console.error('[ERROR]:', error);
            await interaction.reply({ content: `An error occurred while processing outliers. If this error please contact the administrator`, ephemeral: true });
        }
    },
};