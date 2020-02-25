import * as fs from 'fs';
import { Header } from './header';
import { GB } from './gb';
import { Cpu } from './cpu';
import { Gpu } from './gpu';
import { Vram } from './vram';

//const rom_file = "test.gb";
//const rom_file = "roms/01-special.gb";
const rom_file = "roms/hello.gb";

let gb : GB.env | null = null;
try {
    const buf = fs.readFileSync(rom_file)
    const header = new Header(buf);
    console.log(header);

    gb = GB.create(buf);
    while(true){
        const old_cycle = gb.cycle;
        Cpu.step(gb);
        Gpu.step(gb, old_cycle);
    }

} catch (error) {
    console.log(`failed to read ${error}`)

    // debug
    if(gb?.regs.pc == 429){
        try{
            const pixels = Vram.getPixels(gb.mem);
            console.log(pixels);
        }catch(error){
            console.log(`failed to read ${error}`)
        }

    }

}

