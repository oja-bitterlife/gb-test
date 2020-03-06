import { Memory } from "./memory";

export namespace Vram {
    // resolution
    const WIDTH = 160;
    const HEIGHT = 144;

    const ADDR = 0x8000;  // 0x8000-0xA000

    export function getPixels(mem: Memory.Memory) {
        let pixels = new Uint8Array(HEIGHT * WIDTH);
        for (let i = 0; i < HEIGHT * WIDTH; i++) {
            pixels[i] = (Memory.readUByte(mem, ADDR + (i/8*2|0) + 1) >> (7-i%8)) & 1
                      | (Memory.readUByte(mem, ADDR + (i/8*2|0)) >> (7-i%8)) & 1;
        }
        return pixels;
    }
}