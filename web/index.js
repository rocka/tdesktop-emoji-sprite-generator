'use strict';

const SpriteSize = 72;
const SpriteLines = 16;
const SpritePerLine = 32;

const $ = document.querySelector.bind(document);
const cvs = document.getElementsByTagName('canvas')[0];
const ctx = cvs.getContext('2d');

/** @returns {Promise<Blob>} */
function toBlob () {
    return new Promise(resolve => {
        cvs.toBlob(resolve, 'image/webp', 1);
    });
}

function getInputNumber(selector) {
    return Number.parseFloat($(selector).value);
}

/** @type {Promise<string[][]>} */
let Emojis = new Promise((resolve, reject) => {
    fetch('./data.txt')
        .then(r => r.text())
        .then(t => {
            const groups = [];
            const emojis = t.split('\n');
            for (let i = 0; i < emojis.length; i += 512) {
                groups.push(emojis.slice(i, i + 512));
            }
            resolve(groups);
        })
        .catch(e => reject(e));
});

/**
 * @param {number} groupIndex
 * @param {boolean} debug
 * @returns {Promise<Blob[]>}
 */
async function draw(groupIndex, debug) {
    // read settings
    const EmojiFont = $('#emoji-font').value;
    const FontSize = getInputNumber('#font-size');
    const SpriteOffsetX = getInputNumber('#offset-x');
    const SpriteOffsetY = getInputNumber('#offset-y');
    const LimitGlyphWidth = $('#limit-width').checked;

    const blobs = [];
    for (const i of groupIndex) {
        const group = (await Emojis)[i];
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        cvs.width = SpritePerLine * SpriteSize;
        cvs.height = Math.ceil(group.length / SpritePerLine) * SpriteSize;
        // font properties need to be set again after canvas resize
        ctx.font = `${FontSize}px ${EmojiFont}`;
        ctx.textBaseline = 'bottom';
        // draw grid
        if (debug) {
            ctx.strokeStyle = '#ccc';
            for (let i = 1; i < SpritePerLine; i++) {
                ctx.moveTo(SpriteSize * i, 0);
                ctx.lineTo(SpriteSize * i, SpriteSize * SpriteLines);
                ctx.stroke();
            }
            for (let j = 1; j < SpriteLines; j++) {
                ctx.moveTo(0, SpriteSize * j);
                ctx.lineTo(SpriteSize * SpritePerLine, SpriteSize * j);
                ctx.stroke();
            }
        }
        for (let i = 0; i < group.length; i++) {
            const xPos = (i % SpritePerLine) * SpriteSize;
            const yPos = Math.trunc(i / SpritePerLine + 1) * SpriteSize;
            ctx.fillText(group[i], xPos + SpriteOffsetX, yPos + SpriteOffsetY, LimitGlyphWidth ? SpriteSize : undefined);
        }
        blobs.push(await toBlob());
    }
    return blobs;
}

let PreviewIndex = 0;

async function preview(offset) {
    const { length } = await Emojis;
    PreviewIndex = (PreviewIndex + offset + length) % length;
    $('#preview-page').textContent = `${PreviewIndex + 1}/${length}`;
    draw([PreviewIndex], $('#debug').checked);
}

async function generate() {
    const config = {
        id: getInputNumber('#set-id'),
        version: getInputNumber('#set-version')
    };
    const blobs = await draw(Object.keys(await Emojis));
    const content = {
        [`set${config.id}/config.json`]: new TextEncoder().encode(JSON.stringify(config, null, 4).replaceAll('\n', '\r\n'))
    };
    for (let i = 0; i < blobs.length; i++) {
        content[`set${config.id}/emoji_${i + 1}.webp`] = new Uint8Array(await blobs[i].arrayBuffer());
    }
    const href = URL.createObjectURL(new Blob([UZIP.encode(content)], { type: 'application/zip' }));
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.setAttribute('download', `set${config.id}.zip`);
    a.click();
    URL.revokeObjectURL(href);
}
