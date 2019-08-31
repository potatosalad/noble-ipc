import { Duplex } from 'stream'

import * as cm from './command'
import * as ev from './event'
import { ServerCodecLike } from './server'

export class ServerCodecChild extends Duplex implements ServerCodecLike {
    constructor() {
        super({ objectMode: true })
        this.onProcessMessage = this.onProcessMessage.bind(this)
        this.onProcessDisconnect = this.onProcessDisconnect.bind(this)
        if (typeof process.send === 'function') {
            process.on('message', this.onProcessMessage)
            process.on('disconnect', this.onProcessDisconnect)
        } else {
            throw Error(`ServerCodecChild must be started from child_process.fork() to have process.send() available.`)
        }
    }

    public _read(_size: number): void {
        return
    }

    public _write(chunk: ev.Event, _encoding: string, callback: (error?: Error | null | undefined) => void): void {
        process.send!(chunk, callback)
    }

    private onProcessMessage(command?: cm.Command): void {
        if (typeof command === 'object' && typeof command.action === 'string') {
            this.push(command)
        } else {
            throw Error(`Unhandled command received: ${JSON.stringify(command)}`)
        }
    }

    private onProcessDisconnect(): void {
        this.end()
    }
}
