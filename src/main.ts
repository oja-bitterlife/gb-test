import * as fs from 'fs';
import { Header } from './header';
import { GB } from './gb';
import { Cpu } from './cpu';
import { Gpu } from './gpu';
import { Vram } from './vram';

//const rom_file = "test.gb";
//const rom_file = "roms/01-special.gb";
const rom_file = "roms/hello.gb";

try {
    const buf = fs.readFileSync(rom_file)
    const header = new Header(buf);
    console.log(header);

    const gb = GB.create(buf);

//    GB.stepBreak(gb);
    GB.runBreak(gb, [0x15a]);
//    GB.runVBlank(gb);


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