import * as fs from 'fs';
import { Header } from './header';
import { GB } from './gb';
import { Cpu } from './cpu';

//const rom_file = "test.gb";
//const rom_file = "roms/01-special.gb";
const rom_file = "roms/hello.gb";


class Tiles {
    constructor(buffer: Buffer) {
        let offset = 0x8000;
        const tile = this.getTilePixels(buffer.slice(offset, offset + 2 * 8));
        //        console.log(tile);
    }

    private getLinePixels(lower: number, upper: number) {
        let line = [];
        for (let x = 0; x < 8; x++) {
            line.push((((upper >> x) & 1) << 1) | ((lower >> x) & 1));
        }
        return line;
    }

    private getTilePixels(data: Uint8Array) {
        let tile = [];
        for (let y = 0; y < 8; y++) {
            tile.push(this.getLinePixels(data[y * 2], data[y * 2 + 1]));
        }
        return tile;
    }
}



try {
    const buf = fs.readFileSync(rom_file)
    const header = new Header(buf);
    console.log(header);

    const gb = GB.create(buf);
    for (let i = 0; i < 7; i++) Cpu.step(gb);

} catch (error) {
    console.log(`failed to read ${error}`)
}

