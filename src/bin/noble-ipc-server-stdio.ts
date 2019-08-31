import noble from '@abandonware/noble'

import { NobleLike } from '../lib/noble-like'
import { createServer } from '../lib/server'
import { ServerCodecStdio } from '../lib/server-codec-stdio'

async function main(): Promise<void> {
    const codec = new ServerCodecStdio()
    const server = createServer((noble as unknown) as NobleLike, codec)
    await new Promise((resolve) => {
        server.on('end', resolve)
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
