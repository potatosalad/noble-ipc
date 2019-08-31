#!/usr/bin/env node

import noble from '@abandonware/noble'

import { NobleLike } from '../lib/noble-like'
import { createServer } from '../lib/server'
import { ServerCodecChild } from '../lib/server-codec-child'

async function main(): Promise<void> {
    const codec = new ServerCodecChild()
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
