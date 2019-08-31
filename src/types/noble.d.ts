declare module '@abandonware/noble' {
    // Type definitions for noble
    // Project: https://github.com/sandeepmistry/noble
    // Definitions by: Seon-Wook Park <https://github.com/swook>
    //                 Shantanu Bhadoria <https://github.com/shantanubhadoria>
    //                 Luke Libraro <https://github.com/lukel99>
    //                 Dan Chao <https://github.com/bioball>
    //                 Michal Lower <https://github.com/keton>
    //                 Rob Moran <https://github.com/thegecko>
    //                 Clayton Kucera <https://github.com/claytonkucera>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

    /// <reference types="node" />

    import events = require('events')

    export function startScanning(callback?: (error?: Error) => void): void
    export function startScanning(serviceUUIDs: readonly string[], callback?: (error?: Error) => void): void
    export function startScanning(
        serviceUUIDs: readonly string[],
        allowDuplicates: boolean,
        callback?: (error?: Error) => void,
    ): void
    export function stopScanning(callback?: () => void): void

    export function on(event: 'stateChange', listener: (state: string) => void): events.EventEmitter
    export function on(event: 'scanStart', listener: () => void): events.EventEmitter
    export function on(event: 'scanStop', listener: () => void): events.EventEmitter
    export function on(event: 'discover', listener: (peripheral: Peripheral) => void): events.EventEmitter
    export function on(event: string, listener: Function): events.EventEmitter

    export function removeListener(event: 'stateChange', listener: (state: string) => void): events.EventEmitter
    export function removeListener(event: 'scanStart', listener: () => void): events.EventEmitter
    export function removeListener(event: 'scanStop', listener: () => void): events.EventEmitter
    export function removeListener(event: 'discover', listener: (peripheral: Peripheral) => void): events.EventEmitter
    export function removeListener(event: string, listener: Function): events.EventEmitter

    export function removeAllListeners(event?: string): events.EventEmitter

    export var state: string

    export class Peripheral extends events.EventEmitter {
        readonly id: string
        readonly uuid: string
        readonly address: string
        readonly addressType: string
        readonly connectable: boolean
        readonly advertisement: Advertisement
        readonly rssi: number
        readonly services: readonly Service[]
        readonly state: 'error' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected'

        connect(callback?: (error: string) => void): void
        disconnect(callback?: () => void): void
        updateRssi(callback?: (error: string, rssi: number) => void): void
        discoverServices(serviceUUIDs: readonly string[], callback?: (error: string, services: readonly Service[]) => void): void
        discoverAllServicesAndCharacteristics(
            callback?: (error: string, services: readonly Service[], characteristics: readonly Characteristic[]) => void,
        ): void
        discoverSomeServicesAndCharacteristics(
            serviceUUIDs: readonly string[],
            characteristicUUIDs: readonly string[],
            callback?: (error: string, services: readonly Service[], characteristics: readonly Characteristic[]) => void,
        ): void

        readHandle(handle: Buffer, callback: (error: string, data: Buffer) => void): void
        writeHandle(handle: Buffer, data: Buffer, withoutResponse: boolean, callback: (error: string) => void): void
        toString(): string

        on(event: 'connect', listener: (error: string) => void): this
        on(event: 'disconnect', listener: (error: string) => void): this
        on(event: 'rssiUpdate', listener: (rssi: number) => void): this
        on(event: 'servicesDiscover', listener: (services: readonly Service[]) => void): this
        on(event: string, listener: Function): this
    }

    export interface Advertisement {
        readonly localName: string
        readonly serviceData: readonly {
            readonly uuid: string
            readonly data: Buffer
        }[]
        readonly txPowerLevel: number
        readonly manufacturerData: Buffer
        readonly serviceUuids: readonly string[]
    }

    export class Service extends events.EventEmitter {
        readonly uuid: string
        readonly name: string
        readonly type: string
        readonly includedServiceUuids: readonly string[]
        readonly characteristics: readonly Characteristic[]

        discoverIncludedServices(
            serviceUUIDs: readonly string[],
            callback?: (error: string, includedServiceUuids: readonly string[]) => void,
        ): void
        discoverCharacteristics(
            characteristicUUIDs: readonly string[],
            callback?: (error: string, characteristics: readonly Characteristic[]) => void,
        ): void
        toString(): string

        on(event: 'includedServicesDiscover', listener: (includedServiceUuids: readonly string[]) => void): this
        on(event: 'characteristicsDiscover', listener: (characteristics: readonly Characteristic[]) => void): this
        on(event: string, listener: Function): this
    }

    export class Characteristic extends events.EventEmitter {
        readonly uuid: string
        readonly name: string
        readonly type: string
        readonly properties: readonly string[]
        readonly descriptors: readonly Descriptor[]

        read(callback?: (error: string, data: Buffer) => void): void
        write(data: Buffer, notify: boolean, callback?: (error: string) => void): void
        broadcast(broadcast: boolean, callback?: (error: string) => void): void
        notify(notify: boolean, callback?: (error: string) => void): void
        discoverDescriptors(callback?: (error: string, descriptors: readonly Descriptor[]) => void): void
        toString(): string
        subscribe(callback?: (error: string) => void): void
        unsubscribe(callback?: (error: string) => void): void

        on(event: 'read', listener: (data: Buffer, isNotification: boolean) => void): this
        on(event: 'write', withoutResponse: boolean, listener: (error: string) => void): this
        on(event: 'broadcast', listener: (state: string) => void): this
        on(event: 'notify', listener: (state: string) => void): this
        on(event: 'descriptorsDiscover', listener: (descriptors: readonly Descriptor[]) => void): this
        on(event: string, listener: Function): this
        on(event: string, option: boolean, listener: Function): this
    }

    export class Descriptor extends events.EventEmitter {
        readonly uuid: string
        readonly name: string
        readonly type: string

        readValue(callback?: (error: string, data: Buffer) => void): void
        writeValue(data: Buffer, callback?: (error: string) => void): void
        toString(): string

        on(event: 'valueRead', listener: (error: string, data: Buffer) => void): this
        on(event: 'valueWrite', listener: (error: string) => void): this
        on(event: string, listener: Function): this
    }
}
