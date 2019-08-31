import { Duplex } from 'stream'

import * as cm from './command'
import * as ev from './event'
import { ServerCodecLike } from './server'
import { processStdoutHijacker } from './write-hijacker'

const buffers = new WeakMap<ServerCodecStdio, string>()

export class ServerCodecStdio extends Duplex implements ServerCodecLike {
    constructor() {
        super({ objectMode: true })
        buffers.set(this, '')
        this.onStdinReadable = this.onStdinReadable.bind(this)
        this.onStdinEnd = this.onStdinEnd.bind(this)
        processStdoutHijacker.enable()
        process.stdin.on('readable', this.onStdinReadable)
        process.stdin.on('end', this.onStdinEnd)
    }

    public get soFar(): string {
        if (!buffers.has(this)) {
            throw new TypeError('Expected `this` to be an instance of ServerCodecStdio.')
        }
        return buffers.get(this)!
    }

    public _read(_size: number): void {
        return this.onStdinReadable()
    }

    public _write(chunk: ev.Event, encoding: string, callback: (error?: Error | null | undefined) => void): void {
        const frame = JSON.stringify(chunk) + '\n'
        processStdoutHijacker.write(frame, encoding, callback)
    }

    private onStdinReadable(): void {
        const readBuffer: Buffer | string | null = process.stdin.read(),
            soFar: string = this.soFar
        if (readBuffer !== null) {
            const buffer = soFar + readBuffer.toString(),
                lines: readonly string[] = buffer.split(/\r?\n/)
            buffers.set(this, lines[lines.length - 1] || '')
            const heads: readonly string[] = lines.slice(0, -1)
            for (const line of heads) {
                const object = JSON.parse(line)
                if (typeof object === 'object' && typeof object.action === 'string') {
                    this.push(object as cm.Command)
                }
            }
            return this.onStdinReadable()
        }
    }

    private onStdinEnd(): void {
        this.end()
    }
}
