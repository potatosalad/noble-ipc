import childProcess from 'child_process'
import { Duplex } from 'stream'

import * as cm from './command'
import * as ev from './event'
import { ClientCodecLike } from './client'
import { WriteHijacker, createWriteHijacker } from './write-hijacker'

const buffers = new WeakMap<ClientCodecStdio, string>()

export class ClientCodecStdio extends Duplex implements ClientCodecLike {
    private readonly child: childProcess.ChildProcess
    private readonly writeHijacker: WriteHijacker

    constructor() {
        super({ objectMode: true })
        buffers.set(this, '')
        this.onChildStdoutReadable = this.onChildStdoutReadable.bind(this)
        this.onChildStdoutEnd = this.onChildStdoutEnd.bind(this)
        this.child = childProcess.spawn('node', [`${__dirname}/../bin/noble-ipc-server-stdio.js`], {
            stdio: ['pipe', 'pipe', 'inherit'],
        })
        if (this.child.stdin && this.child.stdout) {
            this.writeHijacker = createWriteHijacker(this.child.stdin)
            this.child.stdout.on('readable', this.onChildStdoutReadable)
            this.child.stdout.on('end', this.onChildStdoutEnd)
        } else {
            throw Error(`ClientCodecChild unable to spawn child process with stdin and stdout.`)
        }
    }

    public get soFar(): string {
        if (!buffers.has(this)) {
            throw new TypeError('Expected `this` to be an instance of ClientCodecStdio.')
        }
        return buffers.get(this)!
    }

    public _read(_size: number): void {
        return this.onChildStdoutReadable()
    }

    public _write(chunk: cm.Command, encoding: string, callback: (error?: Error | null | undefined) => void): void {
        const frame = JSON.stringify(chunk) + '\n'
        this.writeHijacker.write(frame, encoding, callback)
    }

    private onChildStdoutReadable(): void {
        const readBuffer: Buffer | string | null = this.child.stdout!.read(),
            soFar: string = this.soFar
        if (readBuffer !== null) {
            const buffer = soFar + readBuffer.toString(),
                lines: readonly string[] = buffer.split(/\r?\n/)
            buffers.set(this, lines[lines.length - 1] || '')
            const heads: readonly string[] = lines.slice(0, -1)
            for (const line of heads) {
                const object = JSON.parse(line)
                if (typeof object === 'object' && typeof object.type === 'string') {
                    this.push(object as ev.Event)
                }
            }
            return this.onChildStdoutReadable()
        }
    }

    private onChildStdoutEnd(): void {
        this.end()
    }
}
