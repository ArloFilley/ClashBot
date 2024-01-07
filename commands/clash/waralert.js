const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CLASH_TOKEN, CLAN_TAG } = require('../../config/config.json');
const { Roles } = require('../../config/config.json');
const { readData } = require('../../utils/readData');
const cocclient = require('clash-of-clans-node');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('waralert')
        .setDescription('Alert all users if there is a war currently happening!'),

    async execute(interaction) {
        try {
            // This command can sometimes take a while so by deferring the reply users aren't frustrated if it has to process
            await interaction.deferReply();

            // Fetches the clan war role
            const clanWarRole = interaction.guild.roles.cache.get(Roles.ClanWarRoleID) || await interaction.guild.roles.fetch(Roles.ClanWarRoleID);

            // Fetches data about the current war
            await cocclient.login(CLASH_TOKEN);
            const currentWar = await cocclient.getClanCurrentWar(CLAN_TAG);

            // Will execute if there isn't a war in preperation or underway
            if (!(currentWar.state === 'preparation' || currentWar.state === 'inWar')) {
                // Embed for no active war
                const embed = new EmbedBuilder()
                    .setTitle(`No Active War - ${currentWar.clan.name}`)
                    .setColor('#00FF00'); // Green color

                await interaction.editreply({ embeds: [embed] });
                return;
            }
            
            const embedTitle = currentWar.state === 'preparation' ? 'Preparation Phase' : 'Ongoing War';
            const embedColor = currentWar.state === 'preparation' ? '#0000FF': '#FF0000';

            let embed = new EmbedBuilder()
                .setTitle(`${embedTitle}: ${currentWar.clan.name} vs ${currentWar.opponent.name}`)
                .setThumbnail(currentWar.clan.badgeUrls.medium)
                .setImage(currentWar.opponent.badgeUrls.medium)
                .addFields(
                    { name: `Start time`, value: `${convertTime(currentWar.startTime)}`, inline: true },
                    { name: `End time`, value: `${convertTime(currentWar.endTime)}`, inline: true },
                    { name: 'Players', value: `${currentWar.clan.members.length} vs ${currentWar.clan.members.length}` },
                )
                .setColor(embedColor);
            
            let membersToAddRole = [];
            let userData = await readData();

            for (const member of currentWar.clan.members) {
                if (userData[member.tag] === undefined) { continue }

                let discordID = interaction.guild.members.cache.get(userData[member.tag]) || await interaction.guild.members.fetch(userData[member.tag]);
                membersToAddRole.push(discordID)
                embed.addFields({ name: `${member.name} - ${member.tag}`, value: `added clan war role`, inline: true });
            }
            
            await interaction.editReply({ 
                content: `<@&${Roles.ClanWarRoleID}>`, 
                embeds: [ embed ], 
                allowedMentions: { roles: [ Roles.ClanWarRoleID ] } 
            });

            // Remove all clan war roles from people
            interaction.guild.members.cache.forEach( async (member) => {
                await member.roles.remove(clanWarRole)
                    .catch(err => console.error(`[Error]: removing role from ${member.user.tag} -> `, err));
            })

            // Reassign clan war role based on those who are in the clan war
            await Promise.all(membersToAddRole.map(member => member.roles.add(clanWarRole)));
            console.log('[Success]: Alerted members of clan war')
        } catch (err) {
            console.error('[Error]: fetching current clan war -> ', error);
            await interaction.reply({ content: 'An error occurred while fetching the current clan war.', ephemeral: true })
                .catch(async () => await interaction.editreply({ content: 'An error occurred while fetching the current clan war.', ephemeral: true }))  
        }
    },
};

/**
 * Converts a date string to a formatted string with the specified options.
 * @param {string} dateString - The input date string in the format 'YYYYMMDDTHHMMSS.000Z'.
 * @returns {string} - A formatted date string in the format 'DD/MM/YYYY HH:mm Timezone'.
 */
function convertTime(DateString) {
    // Parse original string
    const year = DateString.slice(0, 4);
    const month = DateString.slice(4, 6);
    const day = DateString.slice(6, 8);
    const hour = DateString.slice(9, 11);
    const minute = DateString.slice(11, 13);
    const second = DateString.slice(13, 15);

    // Create a new formatted date string
    const dateObject = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`);
    return dateObject.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}