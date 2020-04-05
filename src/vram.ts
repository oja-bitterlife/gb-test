import { Memory } from "./memory";

export namespace Vram {
    let bg_buf = new Uint8Array(256*256);

    const TILE_0 = 0x8800;  // 8000-8FFF
    const TILE_1 = 0x8000;  // 8800-97FF
    const BG_0 = 0x9800;  // 9800-9BFF
    const BG_1 = 0x9c00;  // 9C00-9FFF
    const WINDOW_0 = 0x9800;  // 9800-9BFF
    const WINDOW_1 = 0x9c00;  // 9C00-9FFF

    export const getTile = (mem: Uint8Array, no: number): Uint8Array => {
        let tile = new Uint8Array(8 * 8);

        const tile_addr = (Memory.readUByte(mem, 0xff40) & (1<<4)) == 0 ? TILE_0 : TILE_1;
        const offset = tile_addr + no * 8*2;

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

    const drawTileToBGBuf = (buf_x: number, buf_y: number, tile_8x8: Uint8Array): void => {
        for (let y = 0; y < 8; y++) {
            const yy = (buf_y + y) % 256;
            for (let x = 0; x < 8; x++) {
                const xx = (buf_x + x) % 256;
                bg_buf[yy * 256 + xx] = tile_8x8[y * 8 + x];
            }
        }
    };
    export const getScreen = (mem: Uint8Array): Uint8Array => {
        updateBGBuf(mem);

        const wy = 0;
        const wx = 0;

        let pixels = new Uint8Array(256 * 256);
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                pixels[y*256+x] = bg_buf[(wy+y)*256+(wx+x)];
            }
        }
        return pixels;
    };

    export const updateBGBuf = (mem: Uint8Array) => {
        // clear
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                bg_buf[y*256+x] = 0;
            }
        }

        const sy = mem[0xff42];
        const sx = mem[0xff43];

        const offset = (Memory.readUByte(mem, 0xff40) & (1<<3)) == 0 ? BG_0 : BG_1;

        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const tile_no = mem[offset + (y * 32 + x)];
                const tile = getTile(mem, tile_no);
                drawTileToBGBuf(sx+x*8, sy+y*8, tile);
            }
        }
    }
}