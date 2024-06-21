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

const { ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord.js');


module.exports = {
    data: {
        name: "tictactoe",
        description: "Play tictactoe",
        "integration_types": [1],
        "contexts": [0, 1, 2],
        buttons: [
            [
                { label: '~', custom_id: '1' },
                { label: '~', custom_id: '2' },
                { label: '~', custom_id: '3' }
            ],
            [
                { label: '~', custom_id: '4' },
                { label: '~', custom_id: '5' },
                { label: '~', custom_id: '6' }
            ],
            [
                { label: '~', custom_id: '7' },
                { label: '~', custom_id: '8' },
                { label: '~', custom_id: '9' }
            ]
        ],
    },
    async execute(interaction) {
        var game = {
            board: [
                "~", "~", "~",
                "~", "~", "~",
                "~", "~", "~"
            ],
            player: 'X',
            winner: null
        }

        var buttonRows = this.data.buttons.map(row => {
            function getButtonStyle(button) {
                var style = ButtonStyle.Secondary;
                var label = game.board[parseInt(button.custom_id) - 1];

                if (game.board[parseInt(button.custom_id) - 1] === "X"){
                    style = ButtonStyle.Success;
                } else if (game.board[parseInt(button.custom_id) - 1] === "O"){
                    style = ButtonStyle.Danger;
                }

                return {"style": style, "label": label}
            }

            return new ActionRowBuilder().addComponents(
                row.map(button => new ButtonBuilder()
                    .setLabel(getButtonStyle(button).label)
                    .setCustomId(button.custom_id)
                    .setStyle(getButtonStyle(button).style)
                )
            );
        });

        const response = await interaction.reply({ content: "ticcy taccy toe", components: buttonRows, ephemeral: false });

        const filter = i => i.user.id === interaction.user.id;
        while (true) {
            try {
                const collector = await response.awaitMessageComponent({ filter: filter, time: 60000 });

                await collector.deferUpdate();

                id = parseInt(collector.customId);

                if (game.board[id - 1] === "~") {
                    game.board[id - 1] = "X";
                } else {
                    await interaction.editReply({ content: "Invalid move", components: buttonRows, ephemeral: false });
                    continue;
                }

                // CHANGE BUTTOn

                this.data.buttons = [
                    [
                        { label: game.board[0], custom_id: '1' },
                        { label: game.board[1], custom_id: '2' },
                        { label: game.board[2], custom_id: '3' }
                    ],
                    [
                        { label: game.board[3], custom_id: '4' },
                        { label: game.board[4], custom_id: '5' },
                        { label: game.board[5], custom_id: '6' }
                    ],
                    [
                        { label: game.board[6], custom_id: '7' },
                        { label: game.board[7], custom_id: '8' },
                        { label: game.board[8], custom_id: '9' }
                    ]
                ]
                
                var win_conditions = [
                    [0, 1, 2],
                    [3, 4, 5],
                    [6, 7, 8],
                    [0, 3, 6],
                    [1, 4, 7],
                    [2, 5, 8],
                    [0, 4, 8],
                    [2, 4, 6]
                ]

                function getWinningMove(board, player) {
                    for (let condition of win_conditions) {
                        let values = condition.map(i => board[i]);
                        let emptyCount = values.filter(v => v === "~").length;
                        let playerCount = values.filter(v => v === player).length;
                        if (emptyCount === 1 && playerCount === 2) {
                            return condition[values.indexOf("~")];
                        }
                    }
                
                    return -1;
                }

                var ai_choice;

                var empty = game.board.filter(cell => cell === "~");

                // Check if AI has a winning move
                ai_choice = getWinningMove(game.board, "O");
                if (ai_choice === -1) {
                    // If not, check if player has a winning move and block it
                    ai_choice = getWinningMove(game.board, "X");
                    if (ai_choice === -1) {
                        // If not, make a random move
                        while (true) {
                            if (empty.length === 0){
                                break;
                            }

                            ai_choice = Math.floor(Math.random() * 9);


                            if (game.board[ai_choice] === "~") {
                                break;
                            }
                        }
                    }
                }

                game.board[ai_choice] = "O";

                console.log(game.board)


                buttonRows = this.data.buttons.map(row => {
                    function getButtonStyle(button) {
                        var style = ButtonStyle.Secondary;
                        var label = game.board[parseInt(button.custom_id) - 1];

                        if (game.board[parseInt(button.custom_id) - 1] === "X"){
                            style = ButtonStyle.Success;
                        } else if (game.board[parseInt(button.custom_id) - 1] === "O"){
                            style = ButtonStyle.Danger;
                        }

                        if (parseInt(button.custom_id) === id){
                            style = ButtonStyle.Success;
                            label = "X";
                        }

                        return {"style": style, "label": label}
                    }

                    return new ActionRowBuilder().addComponents(
                        row.map(button => new ButtonBuilder()
                            .setLabel(getButtonStyle(button).label)
                            .setCustomId(button.custom_id)
                            .setStyle(getButtonStyle(button).style)
                        )
                    );
                });

                var win_conditions = [
                    [0, 1, 2],
                    [3, 4, 5],
                    [6, 7, 8],
                    [0, 3, 6],
                    [1, 4, 7],
                    [2, 5, 8],
                    [0, 4, 8],
                    [2, 4, 6]
                ]

                for (condition of win_conditions){
                    if (game.board[condition[0]] === game.board[condition[1]] && game.board[condition[1]] === game.board[condition[2]] && game.board[condition[0]] !== "~"){
                        game.winner = game.board[condition[0]];

                        if (game.winner === "X"){
                            await interaction.editReply({ content: "You win!", components: buttonRows, ephemeral: false });
                            return;
                        } else if (game.winner === "O"){
                            await interaction.editReply({ content: "AI win!", components: buttonRows, ephemeral: false });
                            return;
                        }
                    }
                }

                if (empty.length === 0){
                    await interaction.editReply({ content: "It's a tie!", components: buttonRows, ephemeral: false });
                } else {
                    await interaction.editReply({ content: "ticcy taccy toe", components: buttonRows, ephemeral: false });
                }
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: "Error occured: " + error, components: [] });
                break;
            }
        }

    }
};