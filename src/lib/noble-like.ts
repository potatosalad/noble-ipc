import events from 'events'

import * as ev from './event'

export interface NobleLike extends events.EventEmitter {
    readonly state: ev.State

    startScanning(callback?: (error?: Error) => void): void
    startScanning(serviceUuids: readonly string[], callback?: (error?: Error) => void): void
    startScanning(serviceUuids: readonly string[], allowDuplicates: boolean, callback?: (error?: Error) => void): void
    stopScanning(callback?: () => void): void

    on(event: 'stateChange', listener: (state: ev.State) => void): this
    on(event: 'addressChange', listener: (address: string) => void): this
    on(event: 'scanStart', listener: (filterDuplicates?: boolean) => void): this
    on(event: 'scanStop', listener: () => void): this
    on(event: 'discover', listener: (peripheral: PeripheralLike) => void): this
    on(event: string, listener: Function): this

    removeListener(event: 'stateChange', listener: (state: ev.State) => void): this
    removeListener(event: 'addressChange', listener: (address: string) => void): this
    removeListener(event: 'scanStart', listener: (filterDuplicates?: boolean) => void): this
    removeListener(event: 'scanStop', listener: () => void): this
    removeListener(event: 'discover', listener: (peripheral: PeripheralLike) => void): this
    removeListener(event: string, listener: Function): this

    removeAllListeners(event?: string): this
}

export interface PeripheralLike extends events.EventEmitter {
    readonly id: string
    readonly uuid: string
    readonly address: string
    readonly addressType: string
    readonly connectable: boolean
    readonly advertisement: AdvertisementLike
    readonly rssi: number
    readonly services: readonly ServiceLike[]
    readonly state: 'error' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected'

    connect(callback?: (error: string) => void): void
    disconnect(callback?: () => void): void
    updateRssi(callback?: (error: string, rssi: number) => void): void
    discoverServices(serviceUuids: readonly string[], callback?: (error: string, services: readonly ServiceLike[]) => void): void
    discoverAllServicesAndCharacteristics(
        callback?: (error: string, services: readonly ServiceLike[], characteristics: readonly CharacteristicLike[]) => void,
    ): void
    discoverSomeServicesAndCharacteristics(
        serviceUuids: readonly string[],
        characteristicUuids: readonly string[],
        callback?: (error: string, services: readonly ServiceLike[], characteristics: readonly CharacteristicLike[]) => void,
    ): void

    readHandle(handle: Buffer, callback: (error: string, data: Buffer) => void): void
    writeHandle(handle: Buffer, data: Buffer, withoutResponse: boolean, callback: (error: string) => void): void
    toString(): string

    on(event: 'connect', listener: (error: string) => void): this
    on(event: 'disconnect', listener: (error: string) => void): this
    on(event: 'rssiUpdate', listener: (rssi: number) => void): this
    on(event: 'servicesDiscover', listener: (services: readonly ServiceLike[]) => void): this
    on(event: string, listener: Function): this
}

export interface AdvertisementLike {
    readonly localName: string
    readonly serviceData: readonly {
        readonly uuid: string
        readonly data: Buffer
    }[]
    readonly txPowerLevel: number
    readonly manufacturerData: Buffer
    readonly serviceUuids: readonly string[]
}

export interface ServiceLike extends events.EventEmitter {
    readonly uuid: string
    readonly name: string
    readonly type: string
    readonly includedServiceUuids: readonly string[]
    readonly characteristics: readonly CharacteristicLike[]

    discoverIncludedServices(
        serviceUuids: readonly string[],
        callback?: (error: string, includedServiceUuids: readonly string[]) => void,
    ): void
    discoverCharacteristics(
        characteristicUuids: readonly string[],
        callback?: (error: string, characteristics: readonly CharacteristicLike[]) => void,
    ): void
    toString(): string

    on(event: 'includedServicesDiscover', listener: (includedServiceUuids: readonly string[]) => void): this
    on(event: 'characteristicsDiscover', listener: (characteristics: readonly CharacteristicLike[]) => void): this
    on(event: string, listener: Function): this
}

export interface CharacteristicLike extends events.EventEmitter {
    readonly uuid: string
    readonly name: string
    readonly type: string
    readonly properties: readonly string[]
    readonly descriptors: readonly DescriptorLike[]

    read(callback?: (error: string, data: Buffer) => void): void
    write(data: Buffer, notify: boolean, callback?: (error: string) => void): void
    broadcast(broadcast: boolean, callback?: (error: string) => void): void
    notify(notify: boolean, callback?: (error: string) => void): void
    discoverDescriptors(callback?: (error: string, descriptors: readonly DescriptorLike[]) => void): void
    toString(): string
    subscribe(callback?: (error: string) => void): void
    unsubscribe(callback?: (error: string) => void): void

    on(event: 'read', listener: (data: Buffer, isNotification: boolean) => void): this
    on(event: 'write', withoutResponse: boolean, listener: (error: string) => void): this
    on(event: 'broadcast', listener: (state: string) => void): this
    on(event: 'notify', listener: (state: string) => void): this
    on(event: 'descriptorsDiscover', listener: (descriptors: readonly DescriptorLike[]) => void): this
    on(event: string, listener: Function): this
}

export interface DescriptorLike extends events.EventEmitter {
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
