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

    Debug.stepOver(gb);
//    Gb.runBreak(gb, [0x15a]);
//    Gb.runVBlank(gb);


    const pixels = Vram.getPixels(gb.mem);
//    console.log(pixels);
//    dumpBytes(pixels, 0, 160, 144);

} catch (error) {
    console.log(error);
}

function dumpBytes(buf: Uint8Array, offset: number, width : number, height : number){
    for(let y = 0; y < height; y++){
        let line = "";
        for(let x = 0; x < width; x++){
            let hex = buf[offset + y*width + x].toString(16);
            if(hex.length == 1) hex = "0" + hex;
            line += hex + ",";
        }
        console.log( line );
    }
}