const { SlashCommandBuilder } = require('discord.js');
const { CLASH_TOKEN, CLAN_TAG } = require('../../config/config.json');
const { users } = require('../../data/users.json');
const cocclient = require('clash-of-clans-node');
const { EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('waralert')
        .setDescription('Alert all users if there is a war currently happening!'),

    async execute(interaction) {
        try {
            const clanWarRole = await interaction.guild.roles.fetch('1184837841029709966');
            const clanTagRegex = /^#([A-Z0-9]{3,10})$/;
            await cocclient.login(CLASH_TOKEN);

            const currentWar = await cocclient.getClanCurrentWar(CLAN_TAG, "Coc client logged in");

            if (currentWar.state === 'preparation') {
                // Embed for preparation phase
                const preparationEmbed = new EmbedBuilder()
                    .setTitle(`${currentWar.clan.name} vs ${currentWar.opponent.name}`)
                    .setThumbnail(currentWar.clan.badgeUrls.medium)
                    .setImage(currentWar.opponent.badgeUrls.medium)
                    .addFields({ name: `Start time`, value: `${convertTime(currentWar.startTime)}`, inline: true })
                    .addFields({ name: `End time`, value: `${convertTime(currentWar.endTime)}`, inline: true })
                    .setColor('#FF0000');

                await interaction.reply({ embeds: [preparationEmbed] });
            } else if (currentWar.state === 'inWar') {

                // Embed for ongoing war
                const ongoingWarEmbed = new EmbedBuilder()
                    .setTitle(`${currentWar.clan.name} vs ${currentWar.opponent.name}`)
                    .setThumbnail(currentWar.clan.badgeUrls.medium)
                    .setImage(currentWar.opponent.badgeUrls.medium)
                    .addFields({ name: `Start time`, value: `${convertTime(currentWar.startTime)}`, inline: true })
                    .addFields({ name: `End time`, value: `${convertTime(currentWar.endTime)}`, inline: true })
                    .addFields({ name: "\n", value: "\n"})
                    .addFields({ name: "\n", value: "\n"})
                    .setColor('#FF0000');
                    

                // Iterate over each member in the current war and check for users
                for (const member of currentWar.clan.members) {
                    for (const user of users) {
                        if (user.clashTags.includes(member.tag)) {
                            // Fetch the GuildMember object for the user
                            let guildMember = await interaction.guild.members.fetch(user.discordId);
                            // Assign the war role to the user
                            await guildMember.roles.add(clanWarRole);
                            ongoingWarEmbed.addFields({ name: `User Tag: ${member.tag}`, value: `Role assigned to ${guildMember.user.username}`});
                        }
                    }
                }

                await interaction.reply({ content: `Hello <@&${clanWarRole.id}> There is a war going on`, embeds: [ongoingWarEmbed] });
            } else {
                // Embed for no active war
                const noWarEmbed = new EmbedBuilder()
                    .setTitle(`No Active War - ${currentWar.clan.name}`)
                    .setColor('#008000'); // Green color

                await interaction.reply({ embeds: [noWarEmbed] });
            }
        } catch (error) {
            console.error('Error fetching current clan war:', error);
            // Reply with an error message
            await interaction.reply('An error occurred while fetching current clan war.');
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