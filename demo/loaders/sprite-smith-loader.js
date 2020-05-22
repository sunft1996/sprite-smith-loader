const fs = require('fs');
const path = require('path');
const Spritesmith = require('spritesmith');
const { stringifyRequest } = require('loader-utils');
var valueParser = require('postcss-value-parser');

module.exports = function (source) {

    let outputName = new Date().getTime() + '_smith.png';
    // 清除css中的注释
    const cleanSource = source.replace(/\/\*[\w\W]*\*\//g, '')

    let imgs = cleanSource.match(/url\(.+_sprite.+\)/g);

    const callback = this.async();

    imgs = imgs.map(item => path.resolve(this.context, item.replace(/(url\(.)|(.\))/g, '')));

    Spritesmith.run({ src: imgs }, async (err, result) => {
        if (err) throw err;

        // 雪碧图尺寸
        const imgInfo = result.properties;

        // 子图片的偏移、尺寸信息
        const coord = {};

        for (key in result.coordinates) {
            let newKey = key.match(/\w+_sprite.+/)[0];
            coord[newKey] = result.coordinates[key];
            delete result.coordinates[key];
        }

        const emitFile = (name) => {
            return new Promise((resolve) => {
                fs.mkdir(this.context + '/sprites', { recursive: true }, (err) => {
                    if (err) {
                        throw (err);
                    }
                    fs.writeFileSync(path.resolve(this.context, 'sprites', name), result.image);
                    resolve();
                });
            });
        }
        // 当前目录生成雪碧图
        await emitFile(outputName);

        let parsedValue = valueParser(cleanSource);

        // 包含所有需要转化的css块
        let blocks = {};

        // 找到当前css块的范围
        function findCurrentDeclare(currentIndex) {
            let beginIndex;

            let endIndex;

            parsedValue.walk(node => {
                if (/\{/.test(node.value) && node.sourceIndex < currentIndex) {
                    beginIndex = node.sourceIndex;
                }
                if (endIndex === undefined && /\}/.test(node.value) && node.sourceIndex > currentIndex) {
                    endIndex = node.sourceIndex;
                }
            });
            if (beginIndex === undefined || endIndex === undefined) throw new Error(`css code error!`);
            return {
                beginIndex,
                endIndex,
                currentIndex
            };
        }

        parsedValue.walk(node => {
            if (node.value === 'url' && /_sprite.+/.test(node.nodes[0].value)) {
                blocks[node.sourceIndex] = findCurrentDeclare(node.sourceIndex);
                blocks[node.sourceIndex].url = node.nodes[0].value.match(/\w+_sprite.+/)[0];
            }
        });

        // 转换
        for (const key in blocks) {
            let bgLineStart = 0;
            let bgLineEnd = 0;
            let bgszLineStart = 0;
            let bgszLineEnd = 0;
            let width;
            let height;
            let x;
            let y;
            let ratio;
            const item = blocks[key];
            // 找到background所在行
            parsedValue.walk(node => {
                if (blocks[key].beginIndex <= node.sourceIndex && blocks[key].endIndex >= node.sourceIndex) {
                    if (bgLineStart !== 0 && bgLineEnd !== 0) return;

                    if (bgLineStart === 0 && node.value === 'background') {
                        bgLineStart = node.sourceIndex;
                        return;
                    }

                    if (bgLineStart !== 0 && /;/.test(node.value)) {
                        bgLineEnd = node.sourceIndex;
                        return;
                    }

                }
            });
            // 找到background-size所在行
            parsedValue.walk(node => {
                if (blocks[key].beginIndex <= node.sourceIndex && blocks[key].endIndex >= node.sourceIndex) {
                    if (bgszLineStart !== 0 && bgszLineEnd !== 0) return;

                    if (bgszLineStart === 0 && node.value === 'background-size') {
                        bgszLineStart = node.sourceIndex;
                        return;
                    }

                    if (bgszLineStart !== 0 && /;/.test(node.value)) {
                        bgszLineEnd = node.sourceIndex;
                        return;
                    }

                }
            });

            // 处理 background-size
            parsedValue.walk(node => {
                if (bgszLineStart <= node.sourceIndex && bgszLineEnd >= node.sourceIndex) {

                    // 若background-size只有一个px
                    if (width === undefined && /px;/.test(node.value)) {
                        ratio = node.value.match(/\d+/)[0] / coord[item.url].width;
                        width = imgInfo.width * ratio + 'px ';
                        height = imgInfo.height * ratio + 'px;';
                        node.value = width + height;
                        return;
                    }
                    if (width === undefined && /px/.test(node.value)) {
                        ratio = node.value.match(/\d+/)[0] / coord[item.url].width;
                        width = imgInfo.width * ratio + 'px';
                        node.value = width;
                        return;
                    }
                    if (width !== undefined && height === undefined && /px;/.test(node.value)) {
                        height = imgInfo.height * ratio + 'px;';
                        node.value = height;
                        return;
                    }


                }
            });
            // 处理 background
            if (ratio) {
                parsedValue.walk(node => {
                    if (bgLineStart <= node.sourceIndex && bgLineEnd >= node.sourceIndex) {

                        if (x === undefined && /px/.test(node.value)) {
                            x = - coord[item.url].x * ratio + Number(node.value.match(/-?\d+/)[0]) + 'px';
                            node.value = x;
                            return;
                        }
                        if (x !== undefined && y === undefined && /px;/.test(node.value)) {
                            y = - coord[item.url].y * ratio + Number(node.value.match(/-?\d+/)[0]) + 'px;';
                            node.value = y;
                            return;
                        }
                        if (x !== undefined && y === undefined && /px/.test(node.value)) {
                            y = - coord[item.url].y * ratio + Number(node.value.match(/-?\d+/)[0]) + 'px';
                            node.value = y;
                            return;
                        }
                    }
                });
            }
        }
        callback(null, parsedValue.toString().replace(/url\(.+_sprite.+\)/g, `url(${stringifyRequest(this.context, './sprites/' + outputName)})`));
    });

}