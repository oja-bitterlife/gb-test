import { Memory } from "./memory";

export namespace Gpu {
    type Gpu = {
        cycle: number;
    }

    export function create(): Gpu {
        return {
            cycle: 0,
        }
    }

    export function step(gpu: Gpu, cycle: number, mem: Memory.Memory) {
        gpu.cycle += cycle;

        if(gpu.cycle > 456){
            gpu.cycle -= 456;            
        }
    }
}