export interface WritableLike {
    write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean
    write(chunk: any, encoding: string, cb?: (error: Error | null | undefined) => void): boolean
}

export interface WriteHijacker extends WritableLike {
    enable(): void
    disable(): void
}

export function createWriteHijacker(target: WritableLike): WriteHijacker {
    const noopWrite = function(): boolean {
            return false
        },
        realWrite = target.write
    return {
        enable(): void {
            if (target.write === realWrite) {
                target.write = noopWrite
            }
        },
        disable(): void {
            if (target.write === noopWrite) {
                target.write = realWrite
            }
        },
        write: realWrite.bind(target),
    } as WriteHijacker
}

export default createWriteHijacker

export const processStdoutHijacker = createWriteHijacker(process.stdout)
