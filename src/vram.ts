import { Memory } from "./memory";

export namespace Vram {
    // resolution
    const WIDTH = 256;
    const HEIGHT = 144;

    const ADDR = 0x8000;  // 0x8000-0xA000

    export function getPixels(mem: Memory.Memory) {
        let pixels = new Uint8Array(32*32*20);
        for (let i = 0; i < 32*32*20; i++) {
            pixels[i] = Memory.readUByte(mem, 0x9800 + i);
        }
        return pixels;
    }
}