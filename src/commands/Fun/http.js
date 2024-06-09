const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: "http",
        description: "Replies with a cute cat picture representing a http code!",
        "integration_types":  [1],
        "contexts": [0, 1, 2],
        options: [
            {
                name: 'code',
                type: 4,
                description: 'The HTTP code',
                required: true
            }
        ]
    },
    async execute(interaction) {
        var code = interaction.options.getInteger("code");

        var url = "https://http.cat/" + code;



        await interaction.reply({ content: url, ephemeral: false});
    }
}