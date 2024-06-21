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

const { Groq } = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.groq_api_1 });

const to_replace = ["@everyone", "@here", "nigga", "nigger"];

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

        to_replace.forEach(word => {
            message = message.replace(word, "[FILTERED]");
        })

        await interaction.editReply({ content: message, ephemral: false});
    }
}