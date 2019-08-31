import { Client } from '../lib/client'
import { ClientCodecStdio } from '../lib/client-codec-stdio'

async function main(): Promise<void> {
    const codec = new ClientCodecStdio()
    const client = new Client(codec)
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
