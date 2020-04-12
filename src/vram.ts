import { Memory } from "./memory.js";

export namespace Vram {
    const TILE_0 = 0x9000;  // 8800-97FF
    const TILE_1 = 0x8000;  // 8000-8FFF
    const BG_0 = 0x9800;  // 9800-9BFF
    const BG_1 = 0x9c00;  // 9C00-9FFF
    const WINDOW_0 = 0x9800;  // 9800-9BFF
    const WINDOW_1 = 0x9c00;  // 9C00-9FFF


    export const getScreen = (mem: Uint8Array): Uint8Array => {
        let screen_buf = new Uint8Array(160 * 144);

        // BG Enable
        if(Memory.readUByte(mem, 0xff40) & (1 << 0)){
            const bg_buf = createBGBuf(mem);

            const sy = Memory.readUByte(mem, 0xff42);
            const sx = Memory.readUByte(mem, 0xff43);

            for (let y = 0; y < 144; y++) {
                for (let x = 0; x < 160; x++) {
                    screen_buf[y * 160 + x] = bg_buf[(sy + y) % 256 * 256 + (sx + x) % 256];
                }
            }
        }

        // Win Enable
        if(Memory.readUByte(mem, 0xff40) & (1 << 5)){
            const win_buf = createWinBuf(mem);

            // merge
            const wy = Memory.readUByte(mem, 0xff4a);
            const wx = Memory.readUByte(mem, 0xff4b) - 7;
            for (let y = wy; y < 144; y++) {
                for (let x = wx; x < 160; x++) {
                    const palette = win_buf[(wy + y) % 256 * 256 + (wx + x) % 256];
                    if(palette) screen_buf[y * 160 + x] = palette;
                }
            }
        }

        return screen_buf;
    };
    export const createWinBuf = (mem: Uint8Array): Uint8Array => {
        let win_buf = new Uint8Array(255 * 255);
        const win_addr = (Memory.readUByte(mem, 0xff40) & (1 << 6)) == 0 ? WINDOW_0 : WINDOW_1;

        // to pixels
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const tile = getTile(mem, mem[win_addr + (y * 32 + x)]);
                drawTileToBuf(win_buf, tile, x * 8, y * 8);
            }
        }

        return win_buf;
    }

    export const createBGBuf = (mem: Uint8Array): Uint8Array => {
        let bg_buf = new Uint8Array(255 * 255);
        const bg_addr = (Memory.readUByte(mem, 0xff40) & (1 << 3)) == 0 ? BG_0 : BG_1;

        // to pixels
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const tile = getTile(mem, mem[bg_addr + (y * 32 + x)]);
                drawTileToBuf(bg_buf, tile, x * 8, y * 8);
            }
        }

        return bg_buf;
    }

    const getTile = (mem: Uint8Array, no: number): Uint8Array => {
        let tile = new Uint8Array(8 * 8);

        const tile_mode = (Memory.readUByte(mem, 0xff40) >> 4) & 1;

        if(tile_mode == 0 && no >= 128) no = no-256;  // signed
        const offset = [TILE_0, TILE_1][tile_mode] + no * 8 * 2;

        for (let y = 0; y < 8; y++) {
            const addr = offset + y * 2;

            for (let x = 0; x < 8; x++) {
                const low = Memory.readUByte(mem, addr);
                const hi = Memory.readUByte(mem, addr + 1);
                tile[y * 8 + x] = (((hi >> (7 - x)) & 1) << 1) | ((low >> (7 - x)) & 1);
            }
        }

        return tile;
    };

    const drawTileToBuf = (buf: Uint8Array, tile_8x8: Uint8Array, buf_x: number, buf_y: number): void => {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                buf[(buf_y + y) * 256 + (buf_x + x)] = tile_8x8[y * 8 + x];
            }
        }
    };
}