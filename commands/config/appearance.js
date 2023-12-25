const { ActivityType, SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shapeshift')
        .setDescription('Give ClashBot a smexy makeover!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('avatar')
                .setDescription('Set ClashBot\'s profile picture')
                .addStringOption(option => option.setName('url').setDescription('Valid URL only'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('name')
                .setDescription('Change ClashBot\'s name')
                .addStringOption(option => option.setName('name').setDescription('Provide a good name'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('activity')
                .setDescription('Change what ClashBot is doing')
                .addStringOption(option => option.setName('activity').setDescription('What is ClashBot doing?'))
                .addStringOption(option => option.setName('type').setDescription('How is ClashBot doing it?'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Return ClashBot to its natural state')
        ),
    async execute(interaction) {
        try {
            let client = interaction.client;
            const subcommand = interaction.options.getSubcommand(true);

            switch (subcommand) {
                case 'avatar':
                    await handleAvatar(interaction, client);
                    break;
                case 'name':
                    await handleName(interaction, client);
                    break;
                case 'activity':
                    await handleActivity(interaction, client);
                    break;
                case 'reset':
                    await handleReset(interaction, client);
                    break;
                default:
                    interaction.reply('Invalid subcommand');
            }
        } catch (error) {
            console.error(error);
            interaction.reply('Uh oh, something went wrong!');
        }
    }
};

async function handleAvatar(interaction, client) {
    const url = interaction.options.getString('url') || ''; // Default value or validation
    await client.user.setAvatar(url);
    interaction.reply('PFP successfully changed');
}

async function handleName(interaction, client) {
    const name = interaction.options.getString('name') || ''; // Default value or validation
    await client.user.setUsername(name);
    interaction.reply('Name successfully changed');
}

async function handleActivity(interaction, client) {
    const activity = interaction.options.getString('activity') || ''; // Default value or validation
    const type = interaction.options.getString('type') || 'PLAYING'; // Default value or validation

    switch (type) {
        case 'PLAYING':
            await client.user.setActivity(activity, { type: ActivityType.Playing });
        default:
            await client.user.setActivity(activity);

    }
    
    interaction.reply('Status successfully changed');
}

async function handleReset(interaction, client) {
    await interaction.reply('ClashBot is resetting');
    await client.user.setUsername('ClashBot');
    await client.user.setAvatar('');
    await client.user.setActivity('Clash of Clans', { type: 'PLAYING' });
}
