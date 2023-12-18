'use strict';

const SpriteSize = 72;
const SpriteLines = 16;
const SpritePerLine = 32;

const $ = document.querySelector.bind(document);
const cvs = document.getElementsByTagName('canvas')[0];
const ctx = cvs.getContext('2d');

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const el = document.createElement('script');
        el.setAttribute('src', src);
        document.head.append(el);
        el.onload = resolve;
        el.onerror = reject;
    });
}

/** @returns {Promise<Blob>} */
let toBlob = () => new Promise(resolve => {
    cvs.toBlob(resolve, 'image/webp', 1);
});

(async function () {
    const { width, height } = cvs;
    cvs.width = cvs.height = 1;
    const hasWebP = cvs.toDataURL('image/webp').startsWith('data:image/webp');
    cvs.width = width;
    cvs.height = height;
    if (!hasWebP) {
        $('#generate').setAttribute('disabled', true);
        $('#generate-progress').innerHTML = 'Loading <a href="https://npmjs.org/package/@saschazar/wasm-webp">wasm-webp</a> ...';
        const load = loadScript('//cdn.jsdelivr.net/npm/@saschazar/wasm-webp@3.0.1/wasm_webp.js').then(() => wasm_webp());
        load.then(() => {
            $('#generate-progress').innerHTML = '';
            $('#generate').removeAttribute('disabled');
        })
        toBlob = () => load.then(webp => {
            const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
            const u8a = webp.encode(imgData.data, cvs.width, cvs.height, 4, {
                quality: 100,
                target_size: 0,
                target_PSNR: 0,
                method: 4,
                sns_strength: 50,
                filter_strength: 60,
                filter_sharpness: 0,
                filter_type: 1,
                partitions: 0,
                segments: 4,
                pass: 1,
                show_compressed: 0,
                preprocessing: 0,
                autofilter: 0,
                partition_limit: 0,
                alpha_compression: 1,
                alpha_filtering: 1,
                alpha_quality: 100,
                lossless: 0,
                exact: 0,
                image_hint: 0,
                emulate_jpeg_size: 0,
                thread_level: 0,
                low_memory: 0,
                near_lossless: 100,
                use_delta_palette: 0,
                use_sharp_yuv: 0
            });
            const blob = new Blob([u8a], { type: 'image/webp' });
            console.log(URL.createObjectURL(blob));
            return blob;
        });
    } else {
        $('#generate').removeAttribute('disabled');
    }
})();

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
            $('#preview-page').textContent = `-/${groups.length}`;
            ['preview', 'preview-prev', 'preview-next'].forEach(id => $(`#${id}`).removeAttribute('disabled'));
            resolve(groups);
        })
        .catch(e => reject(e));
});

/**
 * @param {number} groupIndex
 * @param {{ blob: boolean, debug: boolean }} options 
 * @param {(info: { total: number, current: number, phase: 0|1 }) => void} callback 
 * @returns {Promise<Blob[]>}
 */
async function draw(groupIndex, options = {}, callback = () => { }) {
    options = Object.assign({
        blob: true,
        debug: false
    }, options);

    // read settings
    const EmojiFont = $('#emoji-font').value;
    const FontSize = getInputNumber('#font-size');
    const SpriteOffsetX = getInputNumber('#offset-x');
    const SpriteOffsetY = getInputNumber('#offset-y');
    const LimitGlyphWidth = $('#limit-width').checked;

    const groups = await Emojis;
    const blobs = [];
    for (const i of groupIndex) {
        const group = groups[i];
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        cvs.width = SpritePerLine * SpriteSize;
        cvs.height = Math.ceil(group.length / SpritePerLine) * SpriteSize;
        // font properties need to be set again after canvas resize
        ctx.font = `${FontSize}px ${EmojiFont}`;
        ctx.textBaseline = 'bottom';
        // draw grid
        if (options.debug) {
            ctx.fillStyle = '#ddd';
            for (let i = 0; i < SpritePerLine; i++) {
                for (let j = 0; j < SpriteLines; j++) {
                    if ((i + j) % 2 === 1) {
                        ctx.fillRect(SpriteSize * i, SpriteSize * j, SpriteSize, SpriteSize);
                    }
                }
            }
        }
        callback({ total: groups.length, current: +i, phase: 'Generating image ...' });
        for (let i = 0; i < group.length; i++) {
            const xPos = (i % SpritePerLine) * SpriteSize;
            const yPos = Math.trunc(i / SpritePerLine + 1) * SpriteSize;
            ctx.fillText(group[i], xPos + SpriteOffsetX, yPos + SpriteOffsetY, LimitGlyphWidth ? SpriteSize : undefined);
        }
        await new Promise(r => requestAnimationFrame(r));
        if (options.blob) {
            callback({ total: groups.length, current: +i, phase: 'Encoding WebP ...' });
            await new Promise(r => requestAnimationFrame(r));
            blobs.push(await toBlob());
        }
    }
    return blobs;
}

let PreviewIndex = 0;

async function preview(offset) {
    const { length } = await Emojis;
    PreviewIndex = (PreviewIndex + offset + length) % length;
    draw([PreviewIndex], { blob: false, debug: $('#debug').checked }, info => {
        $('#preview-page').textContent = `${info.current + 1}/${info.total}`
    });
}

async function generate() {
    const config = {
        id: getInputNumber('#set-id'),
        version: getInputNumber('#set-version')
    };
    const blobs = await draw(Object.keys(await Emojis), { blob: true }, info => {
        $('#generate-progress').textContent = `(${info.current + 1}/${info.total}) ${info.phase}`;
    });
    $('#generate-progress').textContent = 'Creating .zip archive ...';
    const content = {
        [`set${config.id}/config.json`]: new TextEncoder().encode(JSON.stringify(config, null, 4).replaceAll('\n', '\r\n'))
    };
    for (let i = 0; i < blobs.length; i++) {
        content[`set${config.id}/emoji_${i + 1}.webp`] = new Uint8Array(await blobs[i].arrayBuffer());
    }
    const href = URL.createObjectURL(new Blob([UZIP.encode(content)], { type: 'application/zip' }));
    $('#generate-progress').textContent = '';
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.setAttribute('download', `set${config.id}.zip`);
    a.click();
    URL.revokeObjectURL(href);
}
