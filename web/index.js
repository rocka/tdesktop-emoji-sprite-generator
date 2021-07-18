const EmojiStr = ``;

const SpriteSize = 72;
const SpriteLines = 16;
const SpritePerLine = 32;
const SpriteOffsetX = 0;
const SpriteOffsetY = -5;

const ctx = document.getElementsByTagName('canvas')[0].getContext('2d');
ctx.font = '58px Blobmoji';
ctx.textBaseline = 'bottom';

EmojiStr.split('\n').forEach((e, i) => {
    const xPos = (i % SpritePerLine) * SpriteSize;
    const yPos = Math.trunc(i / SpritePerLine + 1) * SpriteSize;
    console.log(i, e, xPos, yPos);
    ctx.fillText(e, xPos + SpriteOffsetX, yPos + SpriteOffsetY, SpriteSize);
});