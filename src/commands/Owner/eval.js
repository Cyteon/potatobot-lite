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

module.exports = {
    data: {
        name: "eval",
        description: "shush",
        "integration_types":  [1],
        "contexts": [0, 1, 2],
        options: [
            {
                name: 'code',
                type: 3,
                description: ':)',
                required: true
            }
        ]
    },
    async execute(interaction) {
        if (interaction.user.id !== "871722786006138960") return interaction.reply({ content: 'Unexpected F at line 69, character 420', ephemral: true});

        var code = interaction.options.getString('code')
        var result

        try {
            result = eval(code)
        } catch (error) {
            result = error
        }

        await interaction.reply({ content: result.toString(), ephemral: false});
    }
}