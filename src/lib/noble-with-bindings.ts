import { NobleLike } from './noble-like'
import { Bindings } from './bindings'

const createNobleWithBindings: Function = require('@abandonware/noble/with-bindings.js')

export default function nobleWithBindings(bindings: Bindings): NobleLike {
    return createNobleWithBindings(bindings)
}
