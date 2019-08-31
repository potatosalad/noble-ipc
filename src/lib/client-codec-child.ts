import childProcess from 'child_process'
import { Duplex } from 'stream'

import * as cm from './command'
import * as ev from './event'
import { ClientCodecLike } from './client'

export class ClientCodecChild extends Duplex implements ClientCodecLike {
    private readonly child: childProcess.ChildProcess

    constructor() {
        super({ objectMode: true })
        this.onChildMessage = this.onChildMessage.bind(this)
        this.onChildExit = this.onChildExit.bind(this)
        this.child = childProcess.fork(`${__dirname}/../bin/noble-ipc-server-child.js`)
        this.child.on('message', this.onChildMessage)
        this.child.on('exit', this.onChildExit)
    }

    public _read(_size: number): void {
        return
    }

    public _write(chunk: cm.Command, _encoding: string, callback: (error?: Error | null | undefined) => void): void {
        this.child.send(chunk, callback)
    }

    private onChildMessage(event?: ev.Event): void {
        // console.log('parent -> child event: %o', event)
        if (typeof event === 'object' && typeof event.type === 'string') {
            this.push(event)
        } else {
            throw Error(`Unhandled event received: ${JSON.stringify(event)}`)
        }
    }

    private onChildExit(): void {
        // console.log('Child exited')
        this.end()
    }
}
