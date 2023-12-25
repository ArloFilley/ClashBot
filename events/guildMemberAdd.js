const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
		try {
            // Create an embed for the welcome message
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Welcome to Chungus FC!')
                .setThumbnail('https://api-assets.clashofclans.com/badges/512/CjBdRm0ajZlMZyJy9WuAIgzFc1J37bvpgwguwcxRKbg.png')
                .setDescription('Hello Clasher! Please use `/clashtag (your tag here)` in the welcome channel to get your roles.')
                .setAuthor('Clash Bot')
                .setTimestamp(new Date());
    
            // Send the embed as a direct message to the member
            member.send({ embeds: [welcomeEmbed] });
    
            // Log a message when a member joins the server
            console.log(`${member.user.tag} joined the server`);
        } catch (error) {
            console.error('Error sending DM or logging:', error);
        }
	},
};