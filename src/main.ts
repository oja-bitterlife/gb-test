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


const drawCanvas = async (buf: Uint8Array, image_data:ImageData) => {
    const palette = [
        [0xc4, 0xcf, 0xa1],
        [0x8b, 0x95, 0x6d],
        [0x4d, 0x53, 0x3c],
        [0x1f, 0x1f, 0x1f],
    ];

    for (let y = 0; y < image_data.height; y++) {
        for (let x = 0; x < image_data.width; x++) {
            const color = buf[y * image_data.width + x];
            image_data.data[(y*image_data.width+x)*4 + 0] = palette[color][0];
            image_data.data[(y*image_data.width+x)*4 + 1] = palette[color][1];
            image_data.data[(y*image_data.width+x)*4 + 2] = palette[color][2];
            image_data.data[(y*image_data.width+x)*4 + 3] = 255;
        }
    }
};

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


async function main() {
    // create screen
    const canvas = document.getElementById('screen') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const image_data = context!.createImageData(160, 144);
    if(!context){
        // HTML5未対応
        console.error("Canvasの作成失敗");
        return;
    }

    // ROM読み込み
    const res = await fetch("../roms/flappyboy.gb");
    const buf = (await res.body!.getReader().read()).value;

    if(!buf){
        // 読み込み失敗
        console.error("ROMの読み込み失敗");
        return;
    }

    const gb = Gb.create(buf);

    // FPS計算開始
    let fps_count = 0;
    const fpsCountFunc = ()=>{
        if(fps_count) console.log("fps: " + fps_count);
        fps_count = 0;
        setTimeout(()=>{fpsCountFunc()}, 1000);
    };
    setTimeout(()=>{fpsCountFunc()}, 1000);

    // 実行開始
    const mainLoop = (time:number)=>{
        // LCDの状態によって動きを変える
        if(Memory.readUByte(gb.mem, 0xff40)&0x80){
            // VBlankまで実行
            Debug.runVBlank(gb);
        }else{
            // 非表示中は頑張って回す
            const old_cycle = gb.cycle;
            while(gb.cycle-old_cycle < 4000000/60) Gb.step(gb);  // 4MHz / 60fps
        }

        // 画面の描画
        drawCanvas(Vram.getScreen(gb.mem), image_data);
        context.putImageData(image_data, 0, 0);

        // FPS出力
        fps_count++;

        // loop
        requestAnimationFrame(mainLoop);
    };
    requestAnimationFrame(mainLoop);
}

main();
