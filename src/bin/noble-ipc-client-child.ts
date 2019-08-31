import { Client } from '../lib/client'
import { ClientCodecChild } from '../lib/client-codec-child'

async function main(): Promise<void> {
    const codec = new ClientCodecChild()
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
