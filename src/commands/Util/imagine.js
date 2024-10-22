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

const additionalWordsURL =
    "https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en";
let additionalWords = [];

async function fetchAdditionalWords() {
    try {
        const fetch = (await import("node-fetch")).default;
        const response = await fetch(additionalWordsURL);
        const text = await response.text();
        additionalWords = text
            .split("\n")
            .map((word) => word.trim().toLowerCase())
            .filter(Boolean);
    } catch (error) {
        console.error("Failed to fetch additional words list:", error);
    }
}

fetchAdditionalWords();

function isNSFW(text) {
    const nsfwRegex =
        /\b(h[o0]+t+|w[a@]+i+f+u+|n[u*]+d+e+|p[o0]+r+n+|s+e+x+|h+e+n+t+a+i+|x{3,}|b[o0]{2,}bs?|[0o]rg[a@]y|[a@]r[o0]ti[c*k]|f[u*]+c?k+|sh[i1]+t+|d[i1]+c?k+|p[u*]+s+y+|v[a@]+g[i1]+n[a@]+|p+e+n[i1]+s+|[a@]+s+s+(?!(?:ist|um|et))|b[i1]+t+c+h+|c[u*]+n+t+|j[i1]+z+z+|t[i1]+t+(?:t+y+|[i1]+e+s+)?|f[a@]+p+|m[i1]+l+f+|d[i1]+l+d[o0]+|c[o0]+c+k+|k[i1]+n+k+|b+d+s+m+|[s$]+[l1]+[u*]+[t7]+|[pP]+[a@]+[tT]+|[l1]+[e3]+[wW]+[dD]+)\b/i;
    if (nsfwRegex.test(text)) {
        return true;
    }
    const lowerText = text.toLowerCase();
    return additionalWords.some((word) => lowerText.includes(word));
}

module.exports = {
    data: {
        name: "imagine",
        description: "Imagine some AI art + choose model",
        integration_types: [0, 1],
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
                        name: "stable-diffusion-v1-4",
                        value: "CompVis/stable-diffusion-v1-4",
                    },
                    {
                        name: "Dreamshaper XL V2 Turbo",
                        value: "Lykon/dreamshaper-xl-v2-turbo",
                    },
                    {
                        name: "IterComp",
                        value: "comin/IterComp",
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
                required: false,
            },
        ],
    },
    async execute(interaction) {
        await interaction.deferReply();

        const model = interaction.options.getString("model");
        const prompt = interaction.options.getString("prompt");
        const width = interaction.options.getInteger("width");
        const height = interaction.options.getInteger("height");
        const steps = interaction.options.getInteger("steps");
        const api_key = process.env.hf_api_key;

        if (isNSFW(prompt) && interaction.guildId != null) {
            return await interaction.editReply(
                "The prompt you provided is NSFW. Please use this command in an NSFW channel or DM.",
            );
        }

        try {
            const fetch = (await import("node-fetch")).default;
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    headers: {
                        Authorization: `Bearer ${api_key}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            width: width,
                            height: height,
                            inference_steps: steps,
                        },
                        options: { use_cache: false },
                    }),
                },
            );

            if (response.status !== 200) {
                const text = await response.text();
                const json = JSON.parse(text);
                if (response.status === 503) {
                    const est = Math.floor(
                        Date.now() / 1000 + json.estimated_time,
                    );
                    return await interaction.editReply(
                        `The model is currently loading. Try another model, estimated to work <t:${est}:R>.`,
                    );
                } else {
                    console.log(json);
                    return await interaction.editReply(
                        "An error occurred. Please try again later.",
                    );
                }
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            const attach = new AttachmentBuilder(buffer, {
                name: "result.jpeg",
            });

            await interaction.editReply({ files: [attach] });
        } catch (error) {
            if (error.code === 20009) {
                await interaction.editReply(
                    "Explicit content cannot be sent to the desired recipient(s)",
                );
            } else {
                await interaction.editReply("An unknown error occurred");
            }
        }
    },
};
