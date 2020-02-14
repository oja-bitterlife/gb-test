export namespace Gpu {
    type Gpu = {
        cycle: number;
    }

    export function create(): Gpu {
        return {
            cycle: 0,
        }
    }

    export function step(gpu: Gpu, cycle: number) {
        gpu.cycle += cycle;
    }
}