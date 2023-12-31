const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CLASH_TOKEN, CLAN_TAG } = require('../../config/config.json');
const { readData } = require('../../utils/readData')
const cocclient = require('clash-of-clans-node');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raidalert')
        .setDescription('Alert all users that have yet to do their raids!'),

    async execute(interaction) {
        try {
            // This command can sometimes take a while so by deferring the reply users aren't frustrated if it has to process
            await interaction.deferReply();

            // Fetches data about the current raid season
            await cocclient.login(CLASH_TOKEN, "Fetching Data From COC API");
            const raids = await cocclient.getClanCapitalRaidSeason(CLAN_TAG, 1);
            const raid = raids.items[0];
            const clan = await cocclient.getClanMembers(CLAN_TAG);
            const clanMembers = clan.items

            const embed = new EmbedBuilder();

            if (raid.state !== 'ongoing') {
                embed.setTitle('No raids are possible right now').setColor('#FF0000');
                await interaction.editReply({ content: 'No raids are possible right now', ephemeral: true });
                return;
            }

            embed.setTitle('Players who still need to raid').setColor('#FFFF00'); // Change color if needed

            const data = await readData();
            let usersToAlert = clanMembers.map(member => member.tag);

            for (const member of raid.members) {
                if (member.attacks === member.attackLimit + member.bonusAttackLimit) {
                    usersToAlert = usersToAlert.filter(tag => tag !== member.tag);
                } 
            }

            usersToAlert = usersToAlert.map(tag => data[tag]);
            usersToAlert = usersToAlert.filter(discordId => discordId !== undefined);

            let fetchedMembers = await Promise.all(usersToAlert.map(discordId => interaction.guild.members.fetch(discordId)));
            fetchedMembers = fetchedMembers.filter(item => item !== undefined);


            let message = '';
            fetchedMembers.forEach(member => {
                message += `<@${member.id}>\n`;
                embed.addFields({ name: `${member.nickname}`, value: 'still needs to attack' });
            });

            await interaction.editReply({ embeds: [ embed ] });
            await interaction.followUp({ content: message });
            console.log('[Success]: Alerted members of a raid')
        } catch (err) {
            console.error('[Error]: Clan raid couldn\'t be fetched -> ', err);

            await interaction.reply({ content: 'An error occurred while fetching the current clan war.', ephemeral: true })
                .catch(async () => await interaction.editReply({ content: 'An error occurred while fetching the current clan war.', ephemeral: true }));
        }
    },
};

