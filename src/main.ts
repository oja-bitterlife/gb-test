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
    GB.stepVBlank(gb);
    GB.stepVBlank(gb);
    GB.stepVBlank(gb);

    const pixels = Vram.getPixels(gb.mem);
    console.log(pixels);

} catch (error) {
    console.log(`failed to read ${error}`);
}

