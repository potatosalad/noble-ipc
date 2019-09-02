export interface StartScanning {
    readonly action: 'startScanning'
    readonly serviceUuids?: readonly string[]
    readonly allowDuplicates?: boolean
}

export interface StopScanning {
    readonly action: 'stopScanning'
}

export interface Connect {
    readonly action: 'connect'
    readonly peripheralUuid: string
}

export interface Disconnect {
    readonly action: 'disconnect'
    readonly peripheralUuid: string
}

export interface UpdateRssi {
    readonly action: 'updateRssi'
    readonly peripheralUuid: string
}

export interface DiscoverServices {
    readonly action: 'discoverServices'
    readonly peripheralUuid: string
    readonly serviceUuids: readonly string[]
}

export interface DiscoverIncludedServices {
    readonly action: 'discoverIncludedServices'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly serviceUuids: readonly string[]
}

export interface DiscoverCharacteristics {
    readonly action: 'discoverCharacteristics'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuids: readonly string[]
}

export interface Read {
    readonly action: 'read'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
}

export interface Write {
    readonly action: 'write'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly data: string
    readonly withoutResponse: boolean
}

export interface Broadcast {
    readonly action: 'broadcast'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly broadcast: boolean
}

export interface Notify {
    readonly action: 'notify'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly notify: boolean
}

export interface DiscoverDescriptors {
    readonly action: 'discoverDescriptors'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
}

export interface ReadValue {
    readonly action: 'readValue'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly descriptorUuid: string
}

export interface WriteValue {
    readonly action: 'writeValue'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly descriptorUuid: string
    readonly data: string
}

export interface ReadHandle {
    readonly action: 'readHandle'
    readonly peripheralUuid: string
    readonly handle: string
}

export interface WriteHandle {
    readonly action: 'writeHandle'
    readonly peripheralUuid: string
    readonly handle: string
    readonly data: string
    readonly withoutResponse: boolean
}

export interface Ping {
    readonly action: 'ping'
    readonly data: string
}

export interface Stop {
    readonly action: 'stop'
}

export type Command =
    | StartScanning
    | StopScanning
    | Connect
    | Disconnect
    | UpdateRssi
    | DiscoverServices
    | DiscoverIncludedServices
    | DiscoverCharacteristics
    | Read
    | Write
    | Broadcast
    | Notify
    | DiscoverDescriptors
    | ReadValue
    | WriteValue
    | ReadHandle
    | WriteHandle
    | Ping
    | Stop

export interface PeripheralCommandLike {
    readonly peripheralUuid: string
}

export interface ServiceCommandLike {
    readonly peripheralUuid: string
    readonly serviceUuid: string
}

export interface ChracteristicCommandLike {
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
}

export interface DescriptorCommandLike {
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly descriptorUuid: string
}
