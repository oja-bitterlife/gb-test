import * as fs from 'fs';
import { Header } from './header';
import { Gb } from './gb';
import { Vram } from './vram';
import { Debug } from './debug';

//const rom_file = "test.gb";
//const rom_file = "roms/01-special.gb";
const rom_file = "roms/hello.gb";

try {
    const buf = fs.readFileSync(rom_file)
    const header = new Header(buf);
    console.log(header);

    const gb = Gb.create(buf);

    // run
    Debug.runBreak(gb, [0x1ad]);
    const pixels = Vram.getPixels(gb.mem);
    dumpBytes(pixels, 0, 8, 8*100);
    process.exit(0);

    
    // Debug
    function inputLoop(question: string) : Promise<string> {
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
            if(answer == "h" || answer == "help"){
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

        const pixels = Vram.getPixels(gb.mem);
        dumpBytes(pixels, 0, 8, 8*100);

    })();

    //    Gb.runBreak(gb, [0x15a]);
    //    Gb.runVBlank(gb);
} catch (error) {
    console.log(error);
}

function dumpBytes(buf: Uint8Array, offset: number, width: number, height: number) {
    for (let y = 0; y < height; y++) {
        let line = "";
        for (let x = 0; x < width; x++) {
            let hex = buf[offset + y * width + x].toString(16);
            if (hex.length == 1) hex = "0" + hex;
            line += hex + ",";
        }
        console.log(line);
    }
}