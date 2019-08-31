export type State = 'unknown' | 'resetting' | 'unsupported' | 'unauthorized' | 'poweredOff' | 'poweredOn'

export interface StateChange {
    readonly type: 'stateChange'
    readonly state: State
}

export interface AddressChange {
    readonly type: 'addressChange'
    readonly address: string
}

export interface ScanStart {
    readonly type: 'scanStart'
    readonly filterDuplicates?: boolean
}

export interface ScanStop {
    readonly type: 'scanStop'
}

export interface Connect {
    readonly type: 'connect'
    readonly peripheralUuid: string
    readonly error?: string
}

export interface Disconnect {
    readonly type: 'disconnect'
    readonly peripheralUuid: string
}

export interface RssiUpdate {
    readonly type: 'rssiUpdate'
    readonly peripheralUuid: string
    readonly rssi: number
}

export interface IncludedServicesDiscover {
    readonly type: 'includedServicesDiscover'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly includedServiceUuids: readonly string[]
}

export interface Read {
    readonly type: 'read'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly data: string
    readonly isNotification: boolean
}

export interface Write {
    readonly type: 'write'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
}

export interface Broadcast {
    readonly type: 'broadcast'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly state: string
}

export interface Notify {
    readonly type: 'notify'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly state: string
}

export interface ValueRead {
    readonly type: 'valueRead'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly descriptorUuid: string
    readonly data: string
}

export interface ValueWrite {
    readonly type: 'valueWrite'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly descriptorUuid: string
}

export interface DescriptorsDiscover {
    readonly type: 'descriptorsDiscover'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristicUuid: string
    readonly descriptors: readonly string[]
}

export interface DiscoveredCharacteristic {
    readonly uuid: string
    readonly properties: readonly string[]
}

export interface CharacteristicsDiscover {
    readonly type: 'characteristicsDiscover'
    readonly peripheralUuid: string
    readonly serviceUuid: string
    readonly characteristics: readonly DiscoveredCharacteristic[]
}

export interface ServicesDiscover {
    readonly type: 'servicesDiscover'
    readonly peripheralUuid: string
    readonly serviceUuids: readonly string[]
}

export interface HandleRead {
    readonly type: 'handleRead'
    readonly peripheralUuid: string
    readonly handle: string
    readonly data: string
}

export interface HandleWrite {
    readonly type: 'handleWrite'
    readonly peripheralUuid: string
    readonly handle: string
}

export interface HandleNotify {
    readonly type: 'handleNotify'
    readonly peripheralUuid: string
    readonly handle: string
    readonly data: string
}

export interface DiscoverAdvertisementServiceData {
    readonly uuid: string
    readonly data: string
}

export interface DiscoverAdvertisement {
    readonly localName: string
    readonly txPowerLevel: number
    readonly serviceUuids: readonly string[]
    readonly manufacturerData: string | null
    readonly serviceData: readonly DiscoverAdvertisementServiceData[] | null
}

export interface Discover {
    readonly type: 'discover'
    readonly peripheralUuid: string
    readonly address: string
    readonly addressType: string
    readonly connectable: boolean
    readonly advertisement: DiscoverAdvertisement
    readonly rssi: number
}

export type Event =
    | StateChange
    | AddressChange
    | ScanStart
    | ScanStop
    | Connect
    | Disconnect
    | RssiUpdate
    | IncludedServicesDiscover
    | Read
    | Write
    | Broadcast
    | Notify
    | ValueRead
    | ValueWrite
    | DescriptorsDiscover
    | CharacteristicsDiscover
    | ServicesDiscover
    | HandleRead
    | HandleWrite
    | HandleNotify
    | Discover
