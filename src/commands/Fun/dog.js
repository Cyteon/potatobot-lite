const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: {
        name: "dog",
        description: "Replies with a cute dog picture!",
        "integration_types":  [1],
        "contexts": [0, 1, 2]
    },
    async execute(interaction) {
        response = await fetch('https://some-random-api.com/animal/dog');

        json = await response.json();

        imgurl = json.image;

        await interaction.reply({ content: imgurl, ephemeral: false});
    }
}