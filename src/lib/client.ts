import events from 'events'

import * as cm from './command'
import * as ev from './event'
import { Bindings } from './bindings'

export interface ClientCodecLike {
    on(event: 'readable', listener: () => void): this
    on(event: 'end', listener: () => void): this
    read(size?: undefined | number): ev.Event | undefined
    write(chunk: cm.Command, cb?: (error: Error | null | undefined) => void): boolean
    write(chunk: cm.Command, encoding: string, cb?: (error: Error | null | undefined) => void): boolean
}

export class Client extends events.EventEmitter implements Bindings {
    private readonly codec: ClientCodecLike

    constructor(codec: ClientCodecLike) {
        super()
        this.codec = codec
        this.onCodecReadable = this.onCodecReadable.bind(this)
        this.onCodecEnd = this.onCodecEnd.bind(this)
        this.codec.on('readable', this.onCodecReadable)
        this.codec.on('end', this.onCodecEnd)
    }

    public init(): void {
        return
    }

    public startScanning(serviceUuids?: readonly string[], allowDuplicates?: boolean): void {
        if (typeof serviceUuids !== 'undefined') {
            if (typeof allowDuplicates !== 'undefined') {
                this.codec.write({
                    action: 'startScanning',
                    serviceUuids,
                    allowDuplicates,
                } as cm.StartScanning)
            } else {
                this.codec.write({
                    action: 'startScanning',
                    serviceUuids,
                } as cm.StartScanning)
            }
        } else {
            this.codec.write({
                action: 'startScanning',
            } as cm.StartScanning)
        }
    }

    public stopScanning(): void {
        this.codec.write({
            action: 'stopScanning',
        } as cm.StopScanning)
    }

    public connect(peripheralUuid: string): void {
        this.codec.write({
            action: 'connect',
            peripheralUuid,
        } as cm.Connect)
    }

    public disconnect(peripheralUuid: string): void {
        this.codec.write({
            action: 'disconnect',
            peripheralUuid,
        } as cm.Disconnect)
    }

    public updateRssi(peripheralUuid: string): void {
        this.codec.write({
            action: 'updateRssi',
            peripheralUuid,
        } as cm.UpdateRssi)
    }

    public discoverServices(peripheralUuid: string, serviceUuids: readonly string[]): void {
        this.codec.write({
            action: 'discoverServices',
            peripheralUuid,
            serviceUuids,
        } as cm.DiscoverServices)
    }

    public discoverIncludedServices(peripheralUuid: string, serviceUuid: string, serviceUuids: readonly string[]): void {
        this.codec.write({
            action: 'discoverIncludedServices',
            peripheralUuid,
            serviceUuid,
            serviceUuids,
        } as cm.DiscoverIncludedServices)
    }

    public discoverCharacteristics(peripheralUuid: string, serviceUuid: string, characteristicUuids: readonly string[]): void {
        this.codec.write({
            action: 'discoverCharacteristics',
            peripheralUuid,
            serviceUuid,
            characteristicUuids,
        } as cm.DiscoverCharacteristics)
    }

    public read(peripheralUuid: string, serviceUuid: string, characteristicUuid: string): void {
        this.codec.write({
            action: 'read',
            peripheralUuid,
            serviceUuid,
            characteristicUuid,
        } as cm.Read)
    }

    public write(
        peripheralUuid: string,
        serviceUuid: string,
        characteristicUuid: string,
        data: Buffer,
        withoutResponse: boolean,
    ): void {
        this.codec.write({
            action: 'write',
            peripheralUuid,
            serviceUuid,
            characteristicUuid,
            data: data.toString('hex'),
            withoutResponse,
        } as cm.Write)
    }

    public broadcast(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, broadcast: boolean): void {
        this.codec.write({
            action: 'broadcast',
            peripheralUuid,
            serviceUuid,
            characteristicUuid,
            broadcast,
        } as cm.Broadcast)
    }

    public notify(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, notify: boolean): void {
        this.codec.write({
            action: 'notify',
            peripheralUuid,
            serviceUuid,
            characteristicUuid,
            notify,
        } as cm.Notify)
    }

    public discoverDescriptors(peripheralUuid: string, serviceUuid: string, characteristicUuid: string): void {
        this.codec.write({
            action: 'discoverDescriptors',
            peripheralUuid,
            serviceUuid,
            characteristicUuid,
        } as cm.DiscoverDescriptors)
    }

    public readValue(peripheralUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string): void {
        this.codec.write({
            action: 'readValue',
            peripheralUuid,
            serviceUuid,
            characteristicUuid,
            descriptorUuid,
        } as cm.ReadValue)
    }

    public writeValue(
        peripheralUuid: string,
        serviceUuid: string,
        characteristicUuid: string,
        descriptorUuid: string,
        data: Buffer,
    ): void {
        this.codec.write({
            action: 'writeValue',
            peripheralUuid,
            serviceUuid,
            characteristicUuid,
            descriptorUuid,
            data: data.toString('hex'),
        } as cm.WriteValue)
    }

    public readHandle(peripheralUuid: string, handle: Buffer): void {
        this.codec.write({
            action: 'readHandle',
            peripheralUuid,
            handle: handle.toString(),
        } as cm.ReadHandle)
    }

    public writeHandle(peripheralUuid: string, handle: Buffer, data: Buffer, withoutResponse: boolean): void {
        this.codec.write({
            action: 'writeHandle',
            peripheralUuid,
            handle: handle.toString(),
            data: data.toString('hex'),
            withoutResponse,
        } as cm.WriteHandle)
    }

    private readEvent(event: ev.Event): void {
        switch (event.type) {
            case 'stateChange': {
                this.emit('stateChange', event.state)
                break
            }
            case 'addressChange': {
                this.emit('addressChange', event.address)
                break
            }
            case 'scanStart': {
                if (typeof event.filterDuplicates !== 'undefined') {
                    this.emit('scanStart', event.filterDuplicates)
                } else {
                    this.emit('scanStart')
                }
                break
            }
            case 'scanStop': {
                this.emit('scanStop')
                break
            }
            case 'discover': {
                this.emit(
                    'discover',
                    event.peripheralUuid,
                    event.address,
                    event.addressType,
                    event.connectable,
                    event.advertisement,
                    event.rssi,
                )
                break
            }
            case 'connect': {
                if (typeof event.error !== 'undefined') {
                    this.emit('connect', event.peripheralUuid, event.error)
                } else {
                    this.emit('connect', event.peripheralUuid)
                }
                break
            }
            case 'disconnect': {
                this.emit('disconnect', event.peripheralUuid)
                break
            }
            case 'rssiUpdate': {
                this.emit('rssiUpdate', event.peripheralUuid, event.rssi)
                break
            }
            case 'servicesDiscover': {
                this.emit('servicesDiscover', event.peripheralUuid, event.serviceUuids)
                break
            }
            case 'includedServicesDiscover': {
                this.emit('includedServicesDiscover', event.peripheralUuid, event.serviceUuid, event.includedServiceUuids)
                break
            }
            case 'characteristicsDiscover': {
                this.emit('characteristicsDiscover', event.peripheralUuid, event.serviceUuid, event.characteristics)
                break
            }
            case 'read': {
                this.emit(
                    'read',
                    event.peripheralUuid,
                    event.serviceUuid,
                    event.characteristicUuid,
                    Buffer.from(event.data, 'hex'),
                    event.isNotification,
                )
                break
            }
            case 'write': {
                this.emit('write', event.peripheralUuid, event.serviceUuid, event.characteristicUuid)
                break
            }
            case 'broadcast': {
                this.emit('broadcast', event.peripheralUuid, event.serviceUuid, event.characteristicUuid, event.state)
                break
            }
            case 'notify': {
                this.emit('notify', event.peripheralUuid, event.serviceUuid, event.characteristicUuid, event.state)
                break
            }
            case 'descriptorsDiscover': {
                this.emit(
                    'descriptorsDiscover',
                    event.peripheralUuid,
                    event.serviceUuid,
                    event.characteristicUuid,
                    event.descriptors,
                )
                break
            }
            case 'valueRead': {
                this.emit(
                    'valueRead',
                    event.peripheralUuid,
                    event.serviceUuid,
                    event.characteristicUuid,
                    event.descriptorUuid,
                    Buffer.from(event.data, 'hex'),
                )
                break
            }
            case 'valueWrite': {
                this.emit('valueWrite', event.peripheralUuid, event.serviceUuid, event.characteristicUuid, event.descriptorUuid)
                break
            }
            case 'handleRead': {
                this.emit('handleRead', event.peripheralUuid, Buffer.from(event.handle), Buffer.from(event.data, 'hex'))
                break
            }
            case 'handleWrite': {
                this.emit('handleWrite', event.peripheralUuid, Buffer.from(event.handle))
                break
            }
            case 'handleNotify': {
                this.emit('handleNotify', event.peripheralUuid, Buffer.from(event.handle), Buffer.from(event.data, 'hex'))
                break
            }
            default:
                throw Error(`Unhandled event: ${JSON.stringify(event)}`)
        }
        // console.log('child -> parent event: %o', event)
    }

    private onCodecReadable(): void {
        const event: ev.Event | null | undefined = this.codec.read() as ev.Event
        if (event) {
            this.readEvent(event)
            return this.onCodecReadable()
        }
    }

    private onCodecEnd(): void {
        this.emit('end')
    }
}
