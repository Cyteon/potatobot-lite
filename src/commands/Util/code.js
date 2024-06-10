/*
    Author: Cyteon - https://github.com/cyteon
    GIT Repo: https://github.com/Cyteon/potatobot-lite
    License: MIT

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: {
        name: "code",
        description: "Run code in any language",
        "integration_types": [1],
        "contexts": [0, 1, 2]
    },
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('codeModal')
            .setTitle('Run Code');

        const languageInput = new TextInputBuilder()
            .setCustomId('languageInput')
            .setLabel('Language')
            .setPlaceholder('Enter the language of your code')
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(50)
            .setRequired(true);

        const codeInput = new TextInputBuilder()
            .setCustomId('codeInput')
            .setLabel('Code')
            .setPlaceholder('Enter your code here')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(2000)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(languageInput);
        const secondActionRow = new ActionRowBuilder().addComponents(codeInput);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);

        const modalSubmitInteraction = await interaction.awaitModalSubmit({ time: 60_000 });

        const language = modalSubmitInteraction.fields.getTextInputValue('languageInput');
        const code = modalSubmitInteraction.fields.getTextInputValue('codeInput');

        try {
            const response = await axios.post('https://emkc.org/api/v1/piston/execute', {
                language,
                source: code
            });

            const output = response.data.output || 'No output';
            const truncatedOutput = output.length > 500 ? `${output.slice(0, 500)}...\n\n**Output truncated**` : output;
            const embed = {
                color: 0x00FF00,
                title: `Ran your ${response.data.language} code`,
                fields: [
                    {
                        name: 'Output',
                        value: `\`\`\`\n${truncatedOutput}\n\`\`\``
                    }
                ]
            };

            await modalSubmitInteraction.reply({ embeds: [embed] });
        } catch (error) {
            const errorMessage = error.response.data.message || 'Unknown error';
            await modalSubmitInteraction.reply(`An error occurred while running your code: \n\n${errorMessage}`);
        }
    }
};