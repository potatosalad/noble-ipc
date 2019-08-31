import * as ipc from '../src/index'

import { ClientCodecStdio } from '../src/lib/client-codec-stdio'
import nobleWithBindings from '../src/lib/noble-with-bindings'

async function main(): Promise<void> {
    const codec = new ClientCodecStdio()
    const client = new ipc.client.Client(codec)
    const noble = nobleWithBindings(client)
    noble.on('stateChange', (state) => {
        if (state === 'poweredOn') {
            noble.startScanning()
        } else {
            noble.stopScanning()
        }
    })
    noble.on('discover', (peripheral) => {
        console.dir(peripheral)
    })
    await new Promise((resolve) => {
        client.on('end', resolve)
    })
}

;(async () => {
    try {
        await main()
        process.exit(0)
    } catch (e) {
        throw e
    }
})()
