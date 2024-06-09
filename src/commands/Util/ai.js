const { SlashCommandBuilder } = require('@discordjs/builders');

const { Groq } = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.groq_api_1 });

module.exports = {
    data: {
        name: "ai",
        description: "Ask an AI something",
        "integration_types":  [1],
        "contexts": [0, 1, 2],
        options: [
            {
                name: 'prompt',
                type: 3,
                description: 'The prompt to ask the AI',
                required: true
            }
        ]
    },
    async execute(interaction) {
        await interaction.deferReply();

        response = await groq.chat.completions.create({
            model: "llama3-70b-8192",
            messages: [
                {
                    role: "system",
                    content: "Reply in less than 1k characters"
                },
                {
                    role: "user",
                    content: interaction.options.getString('prompt')
                }
            ]
        });

        message = response.choices[0].message.content

        await interaction.editReply({ content: message, ephemral: false});
    }
}