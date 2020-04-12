//import * as fs from 'fs';
import { Header } from './header.js';
import { Gb } from './gb.js';
import { Debug } from './debug.js';
import { Vram } from './vram.js';

import { Memory } from './memory.js';
import { Register } from './register.js';


//const rom_file = "roms/hello.gb";
//const rom_file = "roms/11-op a,(hl).gb";
//const rom_file = "roms/10-bit ops.gb";
//const rom_file = "roms/09-op r,r.gb";
//const rom_file = "roms/08-misc instrs.gb";
//const rom_file = "roms/07-jr,jp,call,ret,rst.gb";
//const rom_file = "roms/06-ld r,r.gb"
//const rom_file = "roms/05-op rp.gb";
//const rom_file = "roms/04-op r,imm.gb";
//const rom_file = "roms/03-op sp,hl.gb";
//const rom_file = "roms/02-interrupts.gb";
//const rom_file = "roms/01-special.gb";
//const rom_file = "roms/cpu_instrs.gb";
//const rom_file = "roms/instr_timing.gb";
//const rom_file = "roms/flappyboy.gb";

/*
const createPng = async (buf: Uint8Array, file_name: string) => {
    const canvas = createCanvas(160, 144);
    const ctx = canvas.getContext('2d')

    const palette = [
        [0xc4, 0xcf, 0xa1],
        [0x8b, 0x95, 0x6d],
        [0x4d, 0x53, 0x3c],
        [0x1f, 0x1f, 0x1f],
    ];

    let imageData = ctx.createImageData(160, 144);
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

    return new Promise((resolve, reject) => {
        const png_stream = canvas.createPNGStream()
        const out_file = fs.createWriteStream(file_name);
        out_file.on('finish', () => {
            console.log(`${file_name} was created.`);
            resolve();
        });
        png_stream.pipe(out_file);
    });
};
*/
/*
const node_main = async () => {
    try {
        const buf = fs.readFileSync(rom_file)
        const header = new Header(buf);
        console.log(header);

        const gb = Gb.create(buf);

        const hexByte = (byte: number): string => { return ('00' + (byte & 0xff).toString(16)).slice(-2); };
        const hexWord = (word: number): string => { return ('0000' + (word & 0xffff).toString(16)).slice(-4); }

        // Debug
        const inputLoop = (question: string): Promise<string> => {
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
                    console.log("(S)tepOver, Step(I)n, Step(O)ut, GotoAddr(0x????), (R)egs, (F)lags, (Q)uit, RUN(run) waitVBlanc(v??)\nDumpByte(b????) DumpWord(w????\nSS(png)");
                }
                else if (answer == "s" || answer == "") Debug.stepOver(gb);
                else if (answer == "i") Gb.step(gb);
                else if (answer == "o") Debug.stepOut(gb);
                else if (answer.indexOf("0x") == 0) Debug.runBreak(gb, [parseInt(answer, 16)]);
                else if (answer == "r") console.log(Register.toString(gb.regs) + ", halt: " + gb.halt);
                else if (answer == "f") console.log(gb.flags);
                else if (answer == "q") break;
                else if (answer == "run") Gb.run(gb);
                else if (answer.indexOf("b") == 0){
                    const addr = parseInt(answer.substr(1), 16);
                    console.log("0x"+hexWord(addr) + ": 0x" + hexByte(Memory.readUByte(gb.mem, addr)));
                }
                else if (answer.indexOf("w") == 0){
                    const addr = parseInt(answer.substr(1), 16);
                    console.log("0x"+hexWord(addr) + ": 0x" + hexWord(Memory.readWord(gb.mem, addr)));
                }
                else if (answer.indexOf("v") == 0){
                    let count = parseInt(answer.substr(1));
                    if(!count) count = 1;
                    for(let i = 0; i < count; i++) Debug.runVBlank(gb);
                }
                else if (answer == "png"){
                    const screen = Vram.getScreen(gb.mem);
                    await createPng(screen, "screen.png");
                }
            }
        })();

    } catch (error) {
        console.log(error);
    }
}
*/
// run main
//node_main();


const buf = new Uint8Array(65536);
const gb = Gb.create(buf);

console.log("hello");
console.log(gb);