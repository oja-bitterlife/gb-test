import * as fs from 'fs';
import {Header} from './header';
import {Cpu} from './cpu';

//const rom_file = "test.gb";
//const rom_file = "roms/01-special.gb";
const rom_file = "roms/hello.gb";


class Tiles {
    constructor(buffer:Buffer){
        let offset = 0x8000;
        const tile = this.getTilePixels(buffer.slice(offset, offset+2*8));
//        console.log(tile);
    }

    private getLinePixels(lower:number, upper:number){
        let line = [];
        for(let x = 0; x < 8; x++){
            line.push( (((upper >> x) & 1) << 1) | ((lower >> x) & 1) );
        }
        return line;
    }

    private getTilePixels(data:Uint8Array){
        let tile = [];
        for(let y = 0; y < 8; y++){
            tile.push( this.getLinePixels(data[y*2], data[y*2+1]) );
        }
        return tile;
    }
}



try {
    let buffer = fs.readFileSync(rom_file)
    console.log(buffer.length);

    const header = new Header(buffer);
    console.log(header);

    const cpu = new Cpu(buffer);
    console.log(cpu);
    cpu.step();
    cpu.step();
    cpu.step();
    cpu.step();
    cpu.step();

    new Tiles(buffer);

    
} catch(error) {
    console.log(`failed to read ${error}`)
}

