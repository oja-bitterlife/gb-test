import * as fs from 'fs';
import { Header } from './header';
import { Gb } from './gb';
import { Vram } from './vram';
import { Debug } from './debug';

import { createCanvas } from 'canvas';
//const { createCanvas, loadImage } = require('canvas')

//const rom_file = "roms/test.gb";
const rom_file = "roms/01-special.gb";
//const rom_file = "roms/hello.gb";


function createPng(buf: Uint8Array) {
//    Debug.dumpBytes(buf, 0, 256, 256);
    const canvas = createCanvas(160, 144);
    const ctx = canvas.getContext('2d')

    const palette = [
        [15, 56, 15],
        [155, 188, 15],
        [139, 172, 15],
        [48, 98, 48],
    ];

    let imageData = ctx.createImageData(256, 256);
    for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
            const color = buf[y * imageData.width + x];
            imageData.data[(y*imageData.width+x)*4 + 0] = palette[color][0];
            imageData.data[(y*imageData.width+x)*4 + 1] = palette[color][1];
            imageData.data[(y*imageData.width+x)*4 + 2] = palette[color][2];
            imageData.data[(y*imageData.width+x)*4 + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);

    console.log('<br><img src="' + canvas.toDataURL() + '" />');
}


try {
    const buf = fs.readFileSync(rom_file)
    const header = new Header(buf);
    console.log(header);

    const gb = Gb.create(buf);

    // run
/*    Debug.runBreak(gb, [0x1ad]);
    const pixels = Vram.getScreen(gb.mem, 0x9800);
    createPng(pixels);

    process.exit(0);
*/

    // Debug
    function inputLoop(question: string): Promise<string> {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve, reject) => {
            // 現在地点のop_codeを表示して
            Debug.printDisasm(gb);

            // キー入力待ち
            readline.question(question, (answer: string) => {
                resolve(answer.toLowerCase());
                readline.close();
            });
        });
    }
    (async function () {
        while (true) {
            const answer = await inputLoop("(help?): ");
            if (answer == "h" || answer == "help") {
                console.log("(S)tepOver, Step(I)n, Step(O)ut, GotoAddr(0x????), (R)egs, (F)lags, (Q)uit, (RUN)");
            }
            else if (answer == "s" || answer == "") Debug.stepOver(gb);
            else if (answer == "i") Debug.stepIn(gb);
            else if (answer == "o") Debug.stepOut(gb);
            else if (answer.indexOf("0x") != -1) Debug.runBreak(gb, [parseInt(answer, 16)]);
            else if (answer == "r") console.log(gb.regs);
            else if (answer == "f") console.log(gb.flags);
            else if (answer == "q") break;
            else if (answer == "run") break;
        }

        Debug.dumpBytes(gb.mem, 0x9800, 32, 18);
    })();

} catch (error) {
    console.log(error);
}

