import * as ev from './event'

export interface Bindings {
    init(): void
    startScanning(serviceUuids?: readonly string[], allowDuplicates?: boolean): void
    stopScanning(): void
    connect(peripheralUuid: string): void
    disconnect(peripheralUuid: string): void
    updateRssi(peripheralUuid: string): void
    discoverServices(peripheralUuid: string, serviceUuids: readonly string[]): void
    discoverIncludedServices(peripheralUuid: string, serviceUuid: string, serviceUuids: readonly string[]): void
    discoverCharacteristics(peripheralUuid: string, serviceUuid: string, characteristicUuids: readonly string[]): void
    read(peripheralUuid: string, serviceUuid: string, characteristicUuid: string): void
    write(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, data: Buffer, withoutResponse: boolean): void
    broadcast(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, broadcast: boolean): void
    notify(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, notify: boolean): void
    discoverDescriptors(peripheralUuid: string, serviceUuid: string, characteristicUuid: string): void
    readValue(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string): void
    writeValue(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string, data: Buffer): void
    readHandle(peripheralUuid: string, handle: Buffer): void
    writeHandle(peripheralUuid: string, handle: Buffer, data: Buffer, withoutResponse: boolean): void

    on(event: 'stateChange', listener: (state: ev.State) => void): this
    on(event: 'addressChange', listener: (address: string) => void): this
    on(event: 'scanStart', listener: (filterDuplicates?: boolean) => void): this
    on(event: 'scanStop', listener: () => void): this
    on(
        event: 'discover',
        listener: (
            uuid: string,
            address: string,
            addressType: string,
            connectable: boolean,
            advertisement: ev.DiscoverAdvertisement,
            rssi: number,
        ) => void,
    ): this
    on(event: 'connect', listener: (peripheralUuid: string, error?: any) => void): this
    on(event: 'disconnect', listener: (peripheralUuid: string) => void): this
    on(event: 'rssiUpdate', listener: (peripheralUuid: string, rssi: number) => void): this
    on(event: 'servicesDiscover', listener: (peripheralUuid: string, serviceUuids: readonly string[]) => void): this
    on(
        event: 'includedServicesDiscover',
        listener: (peripheralUuid: string, serviceUuid: string, includedServiceUuids: readonly string[]) => void,
    ): this
    on(
        event: 'characteristicsDiscover',
        listener: (peripheralUuid: string, serviceUuid: string, characteristics: readonly ev.DiscoveredCharacteristic[]) => void,
    ): this
    on(
        event: 'read',
        listener: (
            peripheralUuid: string,
            serviceUuid: string,
            characteristicUuid: string,
            data: Buffer,
            isNotification: boolean,
        ) => void,
    ): this
    on(event: 'write', listener: (peripheralUuid: string, serviceUuid: string, characteristicUuid: string) => void): this
    on(
        event: 'broadcast',
        listener: (peripheralUuid: string, serviceUuid: string, characteristicUuid: string, state: string) => void,
    ): this
    on(
        event: 'notify',
        listener: (peripheralUuid: string, serviceUuid: string, characteristicUuid: string, state: string) => void,
    ): this
    on(
        event: 'descriptorsDiscover',
        listener: (peripheralUuid: string, serviceUuid: string, characteristicUuid: string, descriptors: readonly string[]) => void,
    ): this
    on(
        event: 'valueRead',
        listener: (
            peripheralUuid: string,
            serviceUuid: string,
            characteristicUuid: string,
            descriptorUuid: string,
            data: Buffer,
        ) => void,
    ): this
    on(
        event: 'valueWrite',
        listener: (peripheralUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string) => void,
    ): this
    on(event: 'handleRead', listener: (peripheralUuid: string, handle: Buffer, data: Buffer) => void): this
    on(event: 'handleWrite', listener: (peripheralUuid: string, handle: Buffer) => void): this
    on(event: 'handleNotify', listener: (peripheralUuid: string, handle: Buffer, data: Buffer) => void): this

    emit(event: 'stateChange', state: ev.State): boolean
    emit(event: 'addressChange', address: string): boolean
    emit(event: 'scanStart', filterDuplicates?: boolean): boolean
    emit(event: 'scanStop'): boolean
    emit(
        event: 'discover',
        peripheralUuid: string,
        address: string,
        addressType: string,
        connectable: boolean,
        advertisement: ev.DiscoverAdvertisement,
        rssi: number,
    ): boolean
    emit(event: 'connect', peripheralUuid: string, error?: any): boolean
    emit(event: 'disconnect', peripheralUuid: string): boolean
    emit(event: 'rssiUpdate', peripheralUuid: string, rssi: number): boolean
    emit(event: 'servicesDiscover', peripheralUuid: string, serviceUuids: readonly string[]): boolean
    emit(
        event: 'includedServicesDiscover',
        peripheralUuid: string,
        serviceUuid: string,
        includedServiceUuids: readonly string[],
    ): boolean
    emit(
        event: 'characteristicsDiscover',
        peripheralUuid: string,
        serviceUuid: string,
        characteristics: readonly ev.DiscoveredCharacteristic[],
    ): boolean
    emit(
        event: 'read',
        peripheralUuid: string,
        serviceUuid: string,
        characteristicUuid: string,
        data: Buffer,
        isNotification: boolean,
    ): boolean
    emit(event: 'write', peripheralUuid: string, serviceUuid: string, characteristicUuid: string): boolean
    emit(event: 'broadcast', peripheralUuid: string, serviceUuid: string, characteristicUuid: string, state: string): boolean
    emit(event: 'notify', peripheralUuid: string, serviceUuid: string, characteristicUuid: string, state: string): boolean
    emit(
        event: 'descriptorsDiscover',
        peripheralUuid: string,
        serviceUuid: string,
        characteristicUuid: string,
        descriptors: readonly string[],
    ): boolean
    emit(
        event: 'valueRead',
        peripheralUuid: string,
        serviceUuid: string,
        characteristicUuid: string,
        descriptorUuid: string,
        data: Buffer,
    ): boolean
    emit(
        event: 'valueWrite',
        peripheralUuid: string,
        serviceUuid: string,
        characteristicUuid: string,
        descriptorUuid: string,
    ): boolean
    emit(event: 'handleRead', peripheralUuid: string, handle: Buffer, data: Buffer): boolean
    emit(event: 'handleWrite', peripheralUuid: string, handle: Buffer): boolean
    emit(event: 'handleNotify', peripheralUuid: string, handle: Buffer, data: Buffer): boolean
}
