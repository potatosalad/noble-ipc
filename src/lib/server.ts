import events from 'events'

import * as cm from './command'
import * as ev from './event'
import * as no from './noble-like'

export interface ServerCodecLike {
    on(event: 'readable', listener: () => void): this
    on(event: 'end', listener: () => void): this
    read(size?: undefined | number): cm.Command | undefined
    write(chunk: ev.Event, cb?: (error: Error | null | undefined) => void): boolean
    write(chunk: ev.Event, encoding: string, cb?: (error: Error | null | undefined) => void): boolean
}

export interface ServerLike extends events.EventEmitter {
    readCommand(command: cm.Command): void
    writeEvent(message: ev.Event): boolean
    on(event: 'end', listener: () => void): this
    on(event: string, listener: Function): this
    removeListener(event: 'end', listener: () => void): this
    removeListener(event: string, listener: Function): this
}

function coerceArray<T>(value: any, transform: (element: any) => T): T[] {
    if (typeof value === 'object') {
        return Array.from(value).map(transform) as T[]
    } else {
        throw TypeError(`Expected value to be an array. Was: ${JSON.stringify(value)}`)
    }
}

function coerceBoolean(value: any): boolean {
    if (value === true || value === 'true' || value === 1) {
        return true
    } else if (value === false || value === 'false' || value === 0) {
        return false
    } else {
        throw TypeError(`Expected value to be a boolean. Was: ${JSON.stringify(value)}`)
    }
}

function coerceNumber(value: any): number {
    if (typeof value === 'number' && !isNaN(value)) {
        return value
    } else if (typeof value === 'string') {
        let number: number | null = null
        try {
            number = parseInt(value)
        } catch (_error) {
            number = null
        }
        if (typeof number === 'number' && !isNaN(number)) {
            return number
        }
    }
    throw TypeError(`Expected value to be a number. Was: ${JSON.stringify(value)}`)
}

function coerceNumberOrNull(value: any): number | null {
    if (typeof value === 'number' || value === null) {
        return value
    } else if (typeof value === 'string') {
        let number: number | null = null
        try {
            number = parseInt(value)
        } catch (_error) {
            number = null
        }
        if (typeof number === 'number' && isNaN(number)) {
            number = null
        }
        return number
    } else if (typeof value === 'undefined') {
        return null
    } else {
        throw TypeError(`Expected value to be number, null, or undefined. Was: ${JSON.stringify(value)}`)
    }
}

function coerceString(value: any): string {
    if (typeof value === 'string') {
        return value
    } else if (typeof value !== 'undefined' && typeof value.toString === 'function') {
        return value.toString()
    } else {
        throw TypeError(`Expected value to be string or have toString() function. Was: ${JSON.stringify(value)}`)
    }
}

function coerceStringOrNull(value: any): string | null {
    if (typeof value === 'string' || value === null) {
        return value
    } else if (typeof value !== 'undefined' && typeof value.toString === 'function') {
        return value.toString()
    } else if (typeof value === 'undefined') {
        return null
    } else {
        throw TypeError(`Expected value to be string, null, or undefined. Was: ${JSON.stringify(value)}`)
    }
}

export function createServer(noble: no.NobleLike, codec: ServerCodecLike): ServerLike {
    const startScanningCommands = new WeakMap<Server, cm.StartScanning>()

    class Server extends events.EventEmitter implements ServerLike {
        private readonly codec: ServerCodecLike
        private readonly peripherals: Record<string, no.PeripheralLike>

        constructor(codec: ServerCodecLike) {
            super()
            this.codec = codec
            this.peripherals = {}
            this.writeEvent = this.writeEvent.bind(this)
            this.onCodecReadable = this.onCodecReadable.bind(this)
            this.onCodecEnd = this.onCodecEnd.bind(this)
            this.onNobleStateChange = this.onNobleStateChange.bind(this)
            this.onNobleAddressChange = this.onNobleAddressChange.bind(this)
            this.onNobleScanStart = this.onNobleScanStart.bind(this)
            this.onNobleScanStop = this.onNobleScanStop.bind(this)
            this.onNobleDiscover = this.onNobleDiscover.bind(this)
            noble.on('stateChange', this.onNobleStateChange)
            noble.on('addressChange', this.onNobleAddressChange)
            noble.on('scanStart', this.onNobleScanStart)
            noble.on('scanStop', this.onNobleScanStop)
            noble.on('discover', this.onNobleDiscover)
            this.onNobleStateChange(noble.state)
            this.codec.on('readable', this.onCodecReadable)
            this.codec.on('end', this.onCodecEnd)
        }

        public readCommand(command: cm.Command): void {
            // console.log(JSON.stringify(command))
            switch (command.action) {
                case 'startScanning': {
                    if (noble.state === 'poweredOn') {
                        if (typeof command.serviceUuids !== 'undefined') {
                            if (typeof command.allowDuplicates !== 'undefined') {
                                noble.startScanning(command.serviceUuids.slice(), command.allowDuplicates)
                            } else {
                                noble.startScanning(command.serviceUuids.slice())
                            }
                        } else {
                            noble.startScanning()
                        }
                    } else {
                        startScanningCommands.set(this, command)
                    }
                    break
                }
                case 'stopScanning': {
                    startScanningCommands.delete(this)
                    noble.stopScanning()
                    break
                }
                case 'connect': {
                    const peripheral = this.requirePeripheral(command)
                    peripheral.connect()
                    break
                }
                case 'disconnect': {
                    const peripheral = this.requirePeripheral(command)
                    peripheral.disconnect()
                    break
                }
                case 'updateRssi': {
                    const peripheral = this.requirePeripheral(command)
                    peripheral.updateRssi()
                    break
                }
                case 'discoverServices': {
                    const peripheral = this.requirePeripheral(command)
                    peripheral.discoverServices(command.serviceUuids.slice())
                    break
                }
                case 'discoverIncludedServices': {
                    const service = this.requireService(command)
                    service.discoverIncludedServices(command.serviceUuids.slice())
                    break
                }
                case 'discoverCharacteristics': {
                    const service = this.requireService(command)
                    service.discoverCharacteristics(command.characteristicUuids.slice())
                    break
                }
                case 'read': {
                    const characteristic = this.requireCharacteristic(command)
                    characteristic.read()
                    break
                }
                case 'write': {
                    const characteristic = this.requireCharacteristic(command)
                    characteristic.write(Buffer.from(command.data, 'hex'), command.withoutResponse)
                    break
                }
                case 'broadcast': {
                    const characteristic = this.requireCharacteristic(command)
                    characteristic.broadcast(command.broadcast)
                    break
                }
                case 'notify': {
                    const characteristic = this.requireCharacteristic(command)
                    characteristic.notify(command.notify)
                    break
                }
                case 'discoverDescriptors': {
                    const characteristic = this.requireCharacteristic(command)
                    characteristic.discoverDescriptors()
                    break
                }
                case 'readValue': {
                    const descriptor = this.requireDescriptor(command)
                    descriptor.readValue()
                    break
                }
                case 'writeValue': {
                    const descriptor = this.requireDescriptor(command)
                    descriptor.writeValue(Buffer.from(command.data, 'hex'))
                    break
                }
                case 'readHandle': {
                    const peripheral = this.requirePeripheral(command)
                    peripheral.readHandle(Buffer.from(command.handle), () => {})
                    break
                }
                case 'writeHandle': {
                    const peripheral = this.requirePeripheral(command)
                    peripheral.writeHandle(
                        Buffer.from(command.handle),
                        Buffer.from(command.data, 'hex'),
                        command.withoutResponse,
                        () => {},
                    )
                    break
                }
                case 'ping': {
                    this.writeEvent({
                        type: 'pong',
                        data: command.data,
                    } as ev.Pong)
                    break
                }
                case 'stop': {
                    this.writeEvent({
                        type: 'stop',
                    } as ev.Stop)
                    this.emit('end')
                    process.nextTick(() => {
                        process.exit(0)
                    })
                    break
                }
                default:
                    throw Error(`Unhandled command: ${JSON.stringify(command)}`)
            }
        }

        public writeEvent(message: ev.Event): boolean {
            return this.codec.write(message)
        }

        private requirePeripheral(command: cm.PeripheralCommandLike): no.PeripheralLike {
            const peripheral: no.PeripheralLike = this.peripherals[command.peripheralUuid]
            if (typeof peripheral === 'undefined') {
                throw Error(`Peripheral '${command.peripheralUuid}' not found.`)
            } else {
                return peripheral
            }
        }

        private requireService(command: cm.ServiceCommandLike): no.ServiceLike {
            const peripheral = this.requirePeripheral(command),
                service: no.ServiceLike | undefined = (() => {
                    if (peripheral.services && peripheral.services.length > 0) {
                        for (const service of peripheral.services) {
                            if (service.uuid === command.serviceUuid) {
                                return service
                            }
                        }
                    }
                    return undefined
                })()
            if (typeof service === 'undefined') {
                throw Error(`Service '${command.serviceUuid}' for peripheral '${command.peripheralUuid}' not found.`)
            } else {
                return service
            }
        }

        private requireCharacteristic(command: cm.ChracteristicCommandLike): no.CharacteristicLike {
            const service = this.requireService(command),
                characteristic: no.CharacteristicLike | undefined = (() => {
                    if (service.characteristics && service.characteristics.length > 0) {
                        for (const characteristic of service.characteristics) {
                            if (characteristic.uuid === command.characteristicUuid) {
                                return characteristic
                            }
                        }
                    }
                    return undefined
                })()
            if (typeof characteristic === 'undefined') {
                throw Error(
                    `Characteristic '${command.characteristicUuid}' for service '${command.serviceUuid}' and peripheral '${command.peripheralUuid}' not found.`,
                )
            } else {
                return characteristic
            }
        }

        private requireDescriptor(command: cm.DescriptorCommandLike): no.DescriptorLike {
            const characteristic = this.requireCharacteristic(command),
                descriptor: no.DescriptorLike | undefined = (() => {
                    if (characteristic.descriptors && characteristic.descriptors.length > 0) {
                        for (const descriptor of characteristic.descriptors) {
                            if (descriptor.uuid === command.descriptorUuid) {
                                return descriptor
                            }
                        }
                    }
                    return undefined
                })()
            if (typeof descriptor === 'undefined') {
                throw Error(
                    `Descriptor '${command.descriptorUuid}' for characteristic '${command.characteristicUuid}', service '${command.serviceUuid}', and peripheral '${command.peripheralUuid}' not found.`,
                )
            } else {
                return descriptor
            }
        }

        private onCodecReadable(): void {
            const command: cm.Command | null | undefined = this.codec.read() as cm.Command
            if (command) {
                this.readCommand(command)
                return this.onCodecReadable()
            }
        }

        private onCodecEnd(): void {
            this.emit('end')
        }

        private onNobleStateChange(state: string): void {
            this.writeEvent({
                type: 'stateChange',
                state,
            } as ev.StateChange)
            if (state === 'poweredOn' && startScanningCommands.has(this)) {
                const command = startScanningCommands.get(this)!
                startScanningCommands.delete(this)
                this.readCommand(command)
            }
        }

        private onNobleAddressChange(address: string): void {
            this.writeEvent({
                type: 'addressChange',
                address,
            } as ev.AddressChange)
        }

        private onNobleScanStart(filterDuplicates?: boolean): void {
            this.writeEvent({
                type: 'scanStart',
                filterDuplicates,
            } as ev.ScanStart)
        }

        private onNobleScanStop(): void {
            this.writeEvent({
                type: 'scanStop',
            } as ev.ScanStop)
        }

        private onNobleDiscover(peripheral: no.PeripheralLike): void {
            this.peripherals[peripheral.uuid] = peripheral
            const server: Server = this
            peripheral.on('connect', function(this: no.PeripheralLike, _error?: string): void {
                const peripheral = this
                server.writeEvent({
                    type: 'connect',
                    peripheralUuid: peripheral.uuid,
                } as ev.Connect)
            })
            peripheral.on('disconnect', function(this: no.PeripheralLike, _error?: string): void {
                const peripheral = this
                server.writeEvent({
                    type: 'disconnect',
                    peripheralUuid: peripheral.uuid,
                } as ev.Disconnect)
                if (peripheral.services && peripheral.services.length > 0) {
                    for (const service of peripheral.services) {
                        if (service.characteristics && service.characteristics.length > 0) {
                            for (const characteristic of service.characteristics) {
                                if (characteristic.descriptors && characteristic.descriptors.length > 0) {
                                    for (const descriptor of characteristic.descriptors) {
                                        descriptor.removeAllListeners()
                                    }
                                }
                                characteristic.removeAllListeners()
                            }
                        }
                        service.removeAllListeners()
                    }
                }
                peripheral.removeAllListeners()
            })
            peripheral.on('rssiUpdate', function(this: no.PeripheralLike, rssi: number): void {
                const peripheral = this
                server.writeEvent({
                    type: 'rssiUpdate',
                    peripheralUuid: peripheral.uuid,
                    rssi,
                } as ev.RssiUpdate)
            })
            peripheral.on('servicesDiscover', function(this: no.PeripheralLike, services: readonly no.ServiceLike[]): void {
                const peripheral = this,
                    includedServicesDiscover = function(this: no.ServiceLike, includedServiceUuids: readonly string[]): void {
                        const service = this
                        server.writeEvent({
                            type: 'includedServicesDiscover',
                            peripheralUuid: peripheral.uuid,
                            serviceUuid: service.uuid,
                            includedServiceUuids,
                        } as ev.IncludedServicesDiscover)
                    },
                    characteristicsDiscover = function(
                        this: no.ServiceLike,
                        characteristics: readonly no.CharacteristicLike[],
                    ): void {
                        const service = this,
                            read = function(this: no.CharacteristicLike, data: Buffer, isNotification: boolean): void {
                                const characteristic = this
                                server.writeEvent({
                                    type: 'read',
                                    peripheralUuid: peripheral.uuid,
                                    serviceUuid: service.uuid,
                                    characteristicUuid: characteristic.uuid,
                                    data: data.toString('hex'),
                                    isNotification,
                                } as ev.Read)
                            },
                            write = function(this: no.CharacteristicLike): void {
                                const characteristic = this
                                server.writeEvent({
                                    type: 'write',
                                    peripheralUuid: peripheral.uuid,
                                    serviceUuid: service.uuid,
                                    characteristicUuid: characteristic.uuid,
                                } as ev.Write)
                            },
                            broadcast = function(this: no.CharacteristicLike, state: string): void {
                                const characteristic = this
                                server.writeEvent({
                                    type: 'broadcast',
                                    peripheralUuid: peripheral.uuid,
                                    serviceUuid: service.uuid,
                                    characteristicUuid: characteristic.uuid,
                                    state,
                                } as ev.Broadcast)
                            },
                            notify = function(this: no.CharacteristicLike, state: string): void {
                                const characteristic = this
                                server.writeEvent({
                                    type: 'notify',
                                    peripheralUuid: peripheral.uuid,
                                    serviceUuid: service.uuid,
                                    characteristicUuid: characteristic.uuid,
                                    state,
                                } as ev.Notify)
                            },
                            descriptorsDiscover = function(
                                this: no.CharacteristicLike,
                                descriptors: readonly no.DescriptorLike[],
                            ): void {
                                const characteristic = this,
                                    valueRead = function(this: no.DescriptorLike, data: Buffer): void {
                                        const descriptor = this
                                        server.writeEvent({
                                            type: 'valueRead',
                                            peripheralUuid: peripheral.uuid,
                                            serviceUuid: service.uuid,
                                            characteristicUuid: characteristic.uuid,
                                            descriptorUuid: descriptor.uuid,
                                            data: data.toString('hex'),
                                        } as ev.ValueRead)
                                    },
                                    valueWrite = function(this: no.DescriptorLike): void {
                                        const descriptor = this
                                        server.writeEvent({
                                            type: 'valueWrite',
                                            peripheralUuid: peripheral.uuid,
                                            serviceUuid: service.uuid,
                                            characteristicUuid: characteristic.uuid,
                                            descriptorUuid: descriptor.uuid,
                                        } as ev.ValueWrite)
                                    }
                                server.writeEvent({
                                    type: 'descriptorsDiscover',
                                    peripheralUuid: peripheral.uuid,
                                    serviceUuid: service.uuid,
                                    characteristicUuid: characteristic.uuid,
                                    descriptors: (() => {
                                        if (descriptors && descriptors.length > 0) {
                                            return descriptors.map((descriptor) => {
                                                descriptor.on('valueRead', valueRead)
                                                descriptor.on('valueWrite', valueWrite)
                                                return descriptor.uuid
                                            })
                                        } else {
                                            return []
                                        }
                                    })(),
                                } as ev.DescriptorsDiscover)
                            }
                        server.writeEvent({
                            type: 'characteristicsDiscover',
                            peripheralUuid: peripheral.uuid,
                            serviceUuid: service.uuid,
                            characteristics: (() => {
                                if (characteristics && characteristics.length > 0) {
                                    return characteristics.map((characteristic) => {
                                        characteristic.on('read', read)
                                        characteristic.on('write', write)
                                        characteristic.on('broadcast', broadcast)
                                        characteristic.on('notify', notify)
                                        characteristic.on('descriptorsDiscover', descriptorsDiscover)
                                        return {
                                            uuid: characteristic.uuid,
                                            properties: characteristic.properties,
                                        } as ev.DiscoveredCharacteristic
                                    })
                                } else {
                                    return []
                                }
                            })(),
                        } as ev.CharacteristicsDiscover)
                    }
                server.writeEvent({
                    type: 'servicesDiscover',
                    peripheralUuid: peripheral.uuid,
                    serviceUuids: (() => {
                        if (services && services.length > 0) {
                            return services.map((service) => {
                                service.on('includedServicesDiscover', includedServicesDiscover)
                                service.on('characteristicsDiscover', characteristicsDiscover)
                                return service.uuid
                            })
                        } else {
                            return []
                        }
                    })(),
                } as ev.ServicesDiscover)
            })
            peripheral.on('handleRead', function(this: no.PeripheralLike, handle: Buffer | string, data: Buffer) {
                const peripheral = this
                server.writeEvent({
                    type: 'handleRead',
                    peripheralUuid: peripheral.uuid,
                    handle: handle.toString(),
                    data: data.toString('hex'),
                } as ev.HandleRead)
            })
            peripheral.on('handleWrite', function(this: no.PeripheralLike, handle: Buffer | string) {
                const peripheral = this
                server.writeEvent({
                    type: 'handleWrite',
                    peripheralUuid: peripheral.uuid,
                    handle: handle.toString(),
                } as ev.HandleWrite)
            })
            peripheral.on('handleNotify', function(this: no.PeripheralLike, handle: Buffer | string, data: Buffer) {
                const peripheral = this
                server.writeEvent({
                    type: 'handleNotify',
                    peripheralUuid: peripheral.uuid,
                    handle: handle.toString(),
                    data: data.toString('hex'),
                } as ev.HandleNotify)
            })
            server.writeEvent({
                type: 'discover',
                peripheralUuid: coerceString(peripheral.uuid),
                address: coerceString(peripheral.address),
                addressType: coerceString(peripheral.addressType),
                connectable: coerceBoolean(peripheral.connectable),
                advertisement: {
                    localName: coerceStringOrNull(peripheral.advertisement.localName),
                    txPowerLevel: coerceNumberOrNull(peripheral.advertisement.txPowerLevel),
                    serviceUuids: peripheral.advertisement.serviceUuids
                        ? coerceArray(peripheral.advertisement.serviceUuids, coerceString)
                        : null,
                    manufacturerData: peripheral.advertisement.manufacturerData
                        ? peripheral.advertisement.manufacturerData.toString('hex')
                        : null,
                    serviceData: peripheral.advertisement.serviceData
                        ? peripheral.advertisement.serviceData.map((serviceData) => {
                              return {
                                  uuid: coerceString(serviceData.uuid),
                                  data: serviceData.data.toString('hex'),
                              }
                          })
                        : null,
                } as ev.DiscoverAdvertisement,
                rssi: coerceNumber(peripheral.rssi),
            } as ev.Discover)
        }
    }

    return new Server(codec)
}
