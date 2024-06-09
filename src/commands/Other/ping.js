const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: "ping",
        description: "did i die again?",
        "integration_types":  [1],
        "contexts": [0, 1, 2]
    },
    async execute(interaction) {
        await interaction.reply({ content: 'weeeeeeeee', ephemral: false});
    }
}