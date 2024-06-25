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

const { AttachmentBuilder } = require("discord.js");

function isNSFW(text) {
    const nsfwRegex =
        /\b(h[o0]+t+|w[a@]+i+f+u+|n[u*]+d+e+|p[o0]+r+n+|s+e+x+|h+e+n+t+a+i+|x{3,}|b[o0]{2,}bs?|[0o]rg[a@]y|[a@]r[o0]ti[c*k]|f[u*]+c?k+|sh[i1]+t+|d[i1]+c?k+|p[u*]+s+y+|v[a@]+g[i1]+n[a@]+|p+e+n[i1]+s+|[a@]+s+s+(?!(?:ist|um|et))|b[i1]+t+c+h+|c[u*]+n+t+|j[i1]+z+z+|t[i1]+t+(?:t+y+|[i1]+e+s+)?|f[a@]+p+|m[i1]+l+f+|d[i1]+l+d[o0]+|c[o0]+c+k+|k[i1]+n+k+|b+d+s+m+|[s$]+[l1]+[u*]+[t7]+|[pP]+[a@]+[tT]+|[l1]+[e3]+[wW]+[dD]+)\b/i;

    return nsfwRegex.test(text);
}

module.exports = {
    data: {
        name: "imagine",
        description: "Imagine some AI art + choose model",
        integration_types: [1],
        contexts: [0, 1, 2],
        options: [
            {
                name: "model",
                type: 3,
                description: "The model to use",
                required: true,
                choices: [
                    {
                        name: "Stable Diffusion XL Base 1.0",
                        value: "stabilityai/stable-diffusion-xl-base-1.0",
                    },
                    {
                        name: "Mobius",
                        value: "Corcelio/mobius",
                    },
                    {
                        name: "Fluently XL Final",
                        value: "fluently/Fluently-XL-Final",
                    },
                    {
                        name: "Rae-Diffusion XL V2",
                        value: "Raelina/Rae-Diffusion-XL-V2",
                    },
                    {
                        name: "Realstic Vision V5.1",
                        value: "SG161222/Realistic_Vision_V5.1_noVAE",
                    },
                    {
                        name: "Counterfeit V2.5",
                        value: "gsdf/Counterfeit-V2.5",
                    },
                ],
            },
            {
                name: "prompt",
                type: 3,
                description: "The prompt to ask the AI",
                required: true,
            },
            {
                name: "negative-prompt",
                type: 3,
                description: "Negative prompt parameter",
                required: false,
            },
            {
                name: "width",
                type: 4,
                description: "Width of the image",
                required: false,
            },
            {
                name: "height",
                type: 4,
                description: "Height of the image",
                required: false,
            },
            {
                name: "steps",
                type: 4,
                description:
                    "Steps AI will take (higher = better quality but slower) (experimental)",
            },
        ],
    },
    async execute(interaction) {
        await interaction.deferReply();

        const model = interaction.options.getString("model");
        const prompt = interaction.options.getString("prompt");
        const negative_prompt =
            interaction.options.getString("negative-prompt");
        const api_key = process.env.hf_api_key;

        console.log(interaction);

        if (isNSFW(prompt)) {
            if (interaction.guildId != null) {
                return await interaction.editReply(
                    "The prompt you provided is NSFW. Please use this command in an DM.",
                );
            }
        }

        const response = await fetch(
            "https://api-inference.huggingface.co/models/" + model,
            {
                headers: {
                    Authorization: "Bearer " + api_key,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    responseType: "arraybuffer",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        negative_prompt:
                            negative_prompt != null ? negative_prompt : "",
                        width: interaction.options.getInteger("width"),
                        height: interaction.options.getInteger("height"),
                        inference_steps:
                            interaction.options.getInteger("steps"),
                    },
                    options: {
                        use_cache: false,
                    },
                }),
            },
        );

        if ((await response.status) != 200) {
            const text = await response.text();
            console.error(response.status.toString() + text);

            const json = JSON.parse(text);

            switch (response.status) {
                case 503:
                    var est = Math.floor(json.estimated_time);
                    var current_unix = Math.floor(Date.now() / 1000);
                    est = parseInt(current_unix + est);

                    return await interaction.editReply({
                        content: `The model is currently loading. Try another model or estaminated to work <t:${est}:R>.`,
                    });
                default:
                    return await interaction.editReply({
                        content: "An error occurred. Please try again later.",
                    });
            }
        }

        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const attach = new AttachmentBuilder(buffer, { name: "result.jpeg" });

        try {
            await interaction.editReply({
                files: [attach],
            });
        } catch (error) {
            switch (error.code) {
                case 20009:
                    return await interaction.editReply({
                        content:
                            "Explicit content cannot be sent to the desired recipient(s)",
                    });
                default:
                    return await interaction.editReply({
                        content: "An unknown error occurred",
                    });
            }
        }
    },
};
