import { Memory } from "./memory";

export namespace Vram {
    // resolution
    const WIDTH = 256;
    const HEIGHT = 144;

    const VRAM = 0x8000;  // 0x8000-0x9FFF
    const SCREEN_0 = 0x9800;  // 9800-9BFF
    const SCREEN_1 = 0x9c00;  // 9C00-9FFF

    export const getTile = (mem: Uint8Array, no: number): Uint8Array => {
        let tile = new Uint8Array(8 * 8);

        const offset = VRAM + no * 8*2;

        for (let y = 0; y < 8; y++) {
            const addr = offset + y*2;

            for (let x = 0; x < 8; x++) {
                const low = Memory.readUByte(mem, addr);
                const hi = Memory.readUByte(mem, addr+1);
                tile[y*8+x] = (((hi>>(7-x))&1)<<1) | ((low>>(7-x))&1);
            }
        }
        return tile;
    };

    const drawTileToPixelBuf = (buf_256x256: Uint8Array, buf_tile_x: number, buf_tile_y: number, tile_8x8: Uint8Array): void => {
        const buf_x = buf_tile_x * 8;
        const buf_y = buf_tile_y * 8;
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                buf_256x256[(buf_y + y) * 256 + buf_x + x] = tile_8x8[y * 8 + x];
            }
        }
    };
    export const getScreen = (mem: Uint8Array, offset: number): Uint8Array => {
        let pixels = new Uint8Array(256 * 256);

        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const tile_no = mem[offset + (y * 32 + x)];
                const tile = getTile(mem, tile_no);
                drawTileToPixelBuf(pixels, x, y, tile);
            }
        }

        return pixels;
    };
}