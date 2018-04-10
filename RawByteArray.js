class RawByteArray {
	constructor (buff) {
		this.offset = 0
		if (buff instanceof RawByteArray) {
			this.buffer = buff.buffer
		} else if (buff instanceof Buffer) {
			this.buffer = buff
		} else {
			this.buffer = new Buffer(typeof (buff) === "number" ? Number(buff) : 1024)
		}
	}

	checkInt (buf, value, offset, ext, max, min) {
		if (!Buffer.isBuffer(buf)) {
			throw new TypeError('"buffer" argument must be a Buffer instance')
		}
		if (value > max || value < min) {
			throw new RangeError('"value" argument is out of bounds')
		}
		if (offset + ext > buf.length) {
			throw new RangeError('Index out of range')
		}
	}

	checkOffset (offset, ext, length) {
		if ((offset % 1) !== 0 || offset < 0) {
			throw new RangeError('offset is not uint')
		}
		if (offset + ext > length) {
			throw new RangeError('Trying to access beyond buffer length')
		}
	}

	checkIEEE754 (buf, value, offset, ext, max, min) {
		if (offset + ext > buf.length) {
			throw new RangeError('Index out of range')
		}
		if (offset < 0) {
			throw new RangeError('Index out of range')
		}
	}

	checkRrs (buf, value, offset) {
		if (typeof offset === "undefined") {
			this.offset = offset
		}
		if (typeof value !== "number" || value % 1 !== 0) {
			throw TypeError("Illegal value: " + value + " (not an integer)")
		}
		if (typeof offset !== "number" || offset % 1 !== 0) {
			throw TypeError("Illegal offset: " + offset + " (not an integer)")
		}
		if (offset < 0 || offset + 0 > buf.length) {
			throw RangeError("Illegal offset: 0 <= " + offset + " (+" + 0 + ") <= " + buf.length)
		}
	}

	readIEEE754 (buffer, offset, isLE, mLen, nBytes) {
		let e, m
		let eLen = (nBytes * 8) - mLen - 1
		let eMax = (1 << eLen) - 1
		let eBias = eMax >> 1
		let nBits = -7
		let i = isLE ? (nBytes - 1) : 0
		let d = isLE ? -1 : 1
		let s = buffer[offset + i]
		i += d
		e = s & ((1 << (-nBits)) - 1)
		s >>= (-nBits)
		nBits += eLen
		for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}
		m = e & ((1 << (-nBits)) - 1)
		e >>= (-nBits)
		nBits += mLen
		for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}
		if (e === 0) {
			e = 1 - eBias
		} else if (e === eMax) {
			return m ? NaN : ((s ? -1 : 1) * Infinity)
		} else {
			m = m + Math.pow(2, mLen)
			e = e - eBias
		}
		return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	writeIEEE754 (buffer, value, offset, isLE, mLen, nBytes) {
		let e, m, c
		let eLen = (nBytes * 8) - mLen - 1
		let eMax = (1 << eLen) - 1
		let eBias = eMax >> 1
		let rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
		let i = isLE ? 0 : (nBytes - 1)
	    let d = isLE ? 1 : -1
	    let s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	    value = Math.abs(value)
	    if (isNaN(value) || value === Infinity) {
	    	m = isNaN(value) ? 1 : 0
	    	e = eMax
	    } else {
	    	e = Math.floor(Math.log(value) / Math.LN2)
	    	if (value * (c = Math.pow(2, -e)) < 1) {
	    		e--
	    		c *= 2
	    	}
	    	if (e + eBias >= 1) {
	    		value += rt / c
	    	} else {
	    		value += rt * Math.pow(2, 1 - eBias)
	    	}
	    	if (value * c >= 2) {
	    	  e++
	    	  c /= 2
	    	}
	    	if (e + eBias >= eMax) {
	    		m = 0
	    		e = eMax
	    	} else if (e + eBias >= 1) {
	    		m = ((value * c) - 1) * Math.pow(2, mLen)
	    		e = e + eBias
	    	} else {
	    		m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	    		e = 0
	    	}
	    }
	    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	    e = (e << mLen) | m
	    eLen += mLen
	    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	    buffer[offset + i - d] |= s * 128
	}

	writeFloat (buf, value, offset, littleEndian) {
		value = +value
		offset = offset >>> 0
		this.checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
		this.writeIEEE754(buf, value, offset, littleEndian, 23, 4)
		return this.offset += 4
	}

	writeDouble (buf, value, offset, littleEndian) {
		value = +value
		offset = offset >>> 0
		this.checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
		this.writeIEEE754(buf, value, offset, littleEndian, 52, 8)
		return this.offset += 8
	}

	writeFloatBE (value) {
		return this.writeFloat(this.buffer, value, this.offset, false)
	}

	writeDoubleBE (value) {
		return this.writeDouble(this.buffer, value, this.offset, false)
	}

	writeString (string) {
		if (string.length < 0) {
			string = "Error"
		}
		this.writeInt8(string.length)
		this.buffer.write(string, this.offset, this.offset += string.length, "utf8")
	}

	writeIntBE (value, byteLength) {
		value = +value
		this.offset = this.offset >>> 0
		let limit = Math.pow(2, (8 * byteLength) - 1)
		this.checkInt(this.buffer, value, this.offset, byteLength, limit - 1, -limit)
		let i = byteLength - 1
		let mul = 1
		let sub = 0
		this.buffer[this.offset + i] = (value & 0xFF)
		while (--i >= 0 && (mul *= 0x100)) {
			if (value < 0 && sub === 0 && this.buffer[this.offset + i + 1] !== 0) {
				sub = 1
			}
			this.buffer[this.offset + i] = ((value / mul) >> 0) - sub & 0xFF
		}
		return this.offset += byteLength
	}

	writeInt8 (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 1, 0x7F, -0x80)
		if (value < 0) {
			value = 0xFF + value + 1
		}
		this.buffer[this.offset] = (value & 0xFF)
	    return this.offset++
	}

	writeInt16BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 2, 0x7FFF, -0x8000)
		this.buffer[this.offset] = (value >>> 8)
		this.buffer[this.offset + 1] = (value & 0xff)
		return this.offset += 2
	}

	writeInt24BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 3, 0x7FFFFF, -0x800000)
		this.buffer[this.offset] = (value >>> 16)
		this.buffer[this.offset + 1] = (value >>> 8)
		this.buffer[this.offset + 2] = (value & 0xFF)
		return this.offset += 3
	}

	writeInt32BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 4, 0x7FFFFFFF, -0x80000000)
		if (value < 0) {
			value = 0xFFFFFFFF + value + 1
		}
		this.buffer[this.offset] = (value >>> 24)
		this.buffer[this.offset + 1] = (value >>> 16)
		this.buffer[this.offset + 2] = (value >>> 8)
		this.buffer[this.offset + 3] = (value & 0xFF)
		return this.offset += 4
	}

	writeInt40BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 5, 0x7FFFFFFFFF, -0x8000000000)
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeInt8(high)
		this.writeUInt32BE(low)
	}

	writeInt48BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 6, 0x7FFFFFFFFFFF, -0x800000000000)
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeInt16BE(high)
		this.writeUInt32BE(low)
	}

	writeInt56BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 7, 0x7FFFFFFFFFFFFF, -0x80000000000000)
		let temp = Math.floor(value / 0x100000000)
		let high = Math.floor(temp / 0x10000)
		let mid = temp - high * 0x10000
		let low = value - temp * 0x100000000
		this.writeInt8(high)
		this.writeUInt16BE(mid)
		this.writeUInt32BE(low)
	}

	writeInt64BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 8, 0x7FFFFFFFFFFFFFFF, -0x8000000000000000)
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeInt32BE(high)
		this.writeUInt32BE(low)
	}

	writeUIntBE (value, byteLength) {
		value = +value
		this.offset = this.offset >>> 0
		byteLength = byteLength >>> 0
		let maxBytes = Math.pow(2, 8 * byteLength) - 1
		this.checkInt(this.buffer, value, this.offset, byteLength, maxBytes, 0)
		let i = byteLength - 1
		let mul = 1
		this.buffer[this.offset + i] = (value & 0xFF)
		while (--i >= 0 && (mul *= 0x100)) {
			this.buffer[this.offset + i] = (value / mul) & 0xFF
		}
		return this.offset += byteLength
	}

	writeUInt8 (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 1, 0xFF, 0)
		this.buffer[this.offset] = (value & 0xFF)
		return this.offset++
	}

	writeUInt16BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 2, 0xFFFF, 0)
		this.buffer[this.offset] = (value >>> 8)
		this.buffer[this.offset + 1] = (value & 0xFF)
		return this.offset += 2
	}

	writeUInt24BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 3, 0xFFFFFF, 0)
		this.buffer[this.offset] = (value >>> 16)
		this.buffer[this.offset + 1] = (value >>> 8)
		this.buffer[this.offset + 2] = (value & 0xFF)
		return this.offset += 3
	}

	writeUInt32BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 4, 0xFFFFFFFF, 0)
		this.buffer[this.offset] = (value >>> 24)
		this.buffer[this.offset + 1] = (value >>> 16)
		this.buffer[this.offset + 2] = (value >>> 8)
		this.buffer[this.offset + 3] = (value & 0xFF)
		return this.offset += 4
	}

	writeUInt40BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 5, 0xFFFFFFFFFF, 0)
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeUInt8(high)
		this.writeUInt32BE(low)
	}

	writeUInt48BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 6, 0xFFFFFFFFFFFF, 0)
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeUInt16BE(high)
		this.writeUInt32BE(low)
	}

	writeUInt56BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 7, 0xFFFFFFFFFFFFFF, 0)
		let temp = Math.floor(value / 0x100000000)
		let high = Math.floor(temp / 0x10000)
		let mid = temp - high * 0x10000
		let low = value - temp * 0x100000000
		this.writeUInt8(high)
		this.writeUInt16BE(mid)
		this.writeUInt32BE(low)
	}

	writeUInt64BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 8, 0xFFFFFFFFFFFFFFFF, 0)
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeUInt32BE(high)
		this.writeUInt32BE(low)
	}

	readFloatBE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 4, this.buffer.length)
		return this.readIEEE754(this.buffer, this.offset, false, 23, 4)
	}

	readDoubleBE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 8, this.buffer.length)
		return this.readIEEE754(this.buffer, this.offset, false, 52, 8)
	}

	readString () {
		let length = this.readUInt8()
		this.offset += length
		return this.buffer.toString("utf8", 1, this.offset)
	}

	readIntBE (byteLength) {
		this.offset = this.offset >>> 0
		byteLength = byteLength >>> 0
		this.checkOffset(this.offset, byteLength, this.buffer.length)
		let i = byteLength
		let mul = 1
		let val = this.buffer[this.offset + --i]
		while (i > 0 && (mul *= 0x100)) {
			val += this.buffer[this.offset + --i] * mul
		}
		mul *= 0x80
		if (val >= mul) {
			val -= Math.pow(2, 8 * byteLength)
		}
		this.offset += byteLength
		return val
	}

	readInt8 () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 1, this.buffer.length)
		this.offset++
		if (!(this.buffer[this.offset] & 0x80)) {
			return this.buffer[this.offset]
		}
		return ((0xFF - this.buffer[this.offset] + 1) * -1)
	}

	readInt16BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 2, this.buffer.length)
		let val = this.buffer[this.offset + 1] | (this.buffer[this.offset] << 8)
		this.offset += 2
		return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	readInt24BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 3, this.buffer.length)
		let val = this.buffer[this.offset + 2] | (this.buffer[this.offset + 1] << 16) | (this.buffer[this.offset] << 8)
		this.offset += 3
		return (val & 0x8000) ? val | 0x7FFF : val
	}

	readInt32BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 4, this.buffer.length)
		let val = this.buffer[this.offset + 3] | (this.buffer[this.offset + 2] << 24) | (this.buffer[this.offset + 1] << 16) | (this.buffer[this.offset] << 8)
		this.offset += 4
		return (val & 0x80000000) ? val | 0x7FFFFFFF : val
	}

	readInt40BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 5, this.buffer.length)
		let val = this.buffer[this.offset + 4] | (this.buffer[this.offset + 3] << 32) | (this.buffer[this.offset + 2] << 24) | (this.buffer[this.offset + 1] << 16) | (this.buffer[this.offset] << 8)
		this.offset += 5
		return (val & 0x8000000000) ? val | 0x7FFFFFFFFF : val
	}

	readInt48BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 6, this.buffer.length)
		let val = this.buffer[this.offset + 5] | (this.buffer[this.offset + 4] << 40) | (this.buffer[this.offset + 3] << 32) | (this.buffer[this.offset + 2] << 24) | (this.buffer[this.offset + 1] << 16) | (this.buffer[this.offset] << 8)
		this.offset += 6
		return (val & 0x800000000000) ? val | 0x7FFFFFFFFFFF : val
	}

	readInt56BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 7, this.buffer.length)
		let val = this.buffer[this.offset + 6] | (this.buffer[this.offset + 5] << 48) | (this.buffer[this.offset + 4] << 40) | (this.buffer[this.offset + 3] << 32) | (this.buffer[this.offset + 2] << 24) | (this.buffer[this.offset + 1] << 16) | (this.buffer[this.offset] << 8)
		this.offset += 7
		return (val & 0x80000000000000) ? val | 0x7FFFFFFFFFFFFF : val
	}

	readInt64BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 8, this.buffer.length)
		let val = this.buffer[this.offset + 7] | (this.buffer[this.offset + 6] << 56) | (this.buffer[this.offset + 5] << 48) | (this.buffer[this.offset + 4] << 40) | (this.buffer[this.offset + 3] << 32) | (this.buffer[this.offset + 2] << 24) | (this.buffer[this.offset + 1] << 16) | (this.buffer[this.offset] << 8)
		this.offset += 8
		return (val & 0x8000000000000000) ? val | 0x7FFFFFFFFFFFFFFF : val
	}

	readUIntBE (byteLength) {
		let i = byteLength
		this.offset = this.offset >>> 0
		byteLength = byteLength >>> 0
		this.checkOffset(this.offset, byteLength, this.buffer.length)
		let val = this.buffer[this.offset + --byteLength]
		let mul = 1
		while (byteLength > 0 && (mul *= 0x100)) {
			val += this.buffer[this.offset + --byteLength] * mul
		}
		this.offset += i
		return val
	}

	readUInt8 () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 1, this.buffer.length)
		return this.buffer[this.offset++]
	}

	readUInt16BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 2, this.buffer.length)
		let val = (this.buffer[this.offset] << 8) | this.buffer[this.offset + 1]
		this.offset += 2
		return val
	}

	readUInt24BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 3, this.buffer.length)
		let val = (this.buffer[this.offset] << 16) | (this.buffer[this.offset + 1] << 8) + (this.buffer[this.offset + 2])
		this.offset += 3
		return val
	}

	readUInt32BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 4, this.buffer.length)
		let val = (this.buffer[this.offset] * 0x1000000) + (this.buffer[this.offset + 1] << 16) | (this.buffer[this.offset + 2] << 8) | (this.buffer[this.offset + 3])
		this.offset += 4
		return val
	}

	readUInt40BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 5, this.buffer.length)
		let val = (this.buffer[this.offset] * 0x100000000) + (this.buffer[this.offset + 1] * 0x1000000) + (this.buffer[this.offset + 2] * 0x10000) + (this.buffer[this.offset + 3] * 0x100) + (this.buffer[this.offset + 4])
		this.offset += 5
		return val
	}

	readUInt48BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 6, this.buffer.length)
		let val = (this.buffer[this.offset] * 0x100 + this.buffer[this.offset + 1]) * 0x100000000 + this.buffer[this.offset + 2] * 0x1000000 + this.buffer[this.offset + 3] * 0x10000 + this.buffer[this.offset + 4] * 0x100 + this.buffer[this.offset + 5]
		this.offset += 6
		return val
	}

	readUInt56BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 7, this.buffer.length)
		let val = ((this.readUInt8() || 0) << 16 | this.readUInt16BE()) * (1 << 16) * (1 << 16) + this.readUInt32BE()
		return val
	}

	readUInt64BE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 8, this.buffer.length)
		let val = this.readUInt32BE() * (1 << 16) * (1 << 16) + this.readUInt32BE()
		return val
	}

	writeFloatLE (value) {
		return this.writeFloat(this.buffer, value, this.offset, true)
	}

	writeDoubleLE (value) {
		return this.writeDouble(this.buffer, value, this.offset, true)
	}

	writeIntLE (value, byteLength) {
		value = +value
		this.offset = this.offset >>> 0
		let limit = Math.pow(2, (8 * byteLength) - 1)
		this.checkInt(this.buffer, value, this.offset, byteLength, limit - 1, -limit)
		let i = 0
		let mul = 1
		let sub = 0
		this.buffer[this.offset] = (value & 0xFF)
		while (++i < byteLength && (mul *= 0x100)) {
			if (value < 0 && sub === 0 && this.buffer[this.offset + i - 1] !== 0) {
				sub = 1
			}
			this.buffer[this.offset + i] = ((value / mul) >> 0) - sub & 0xFF
		}
		return this.offset += byteLength
	}

	writeInt16LE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 2, 0x7FFF, -0x8000)
		this.buffer[this.offset] = (value & 0xFF)
		this.buffer[this.offset + 1] = (value >>> 8)
		return this.offset += 2
	}

	writeInt24LE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value. this.offset, 3, 0x7FFFFF, -0x800000)
		this.buffer[this.offset] = (value & 0xFF)
		this.buffer[this.offset + 1] = (value >>> 8)
		this.buffer[this.offset + 2] = (value >>> 16)
		return this.offset += 3
	}

	writeInt32LE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 4, 0x7FFFFFFF, -0x80000000)
		this.buffer[this.offset] = (value & 0xFF)
		this.buffer[this.offset + 1] = (value >>> 8)
		this.buffer[this.offset + 2] = (value >>> 16)
		this.buffer[this.offset + 3] = (value >>> 24)
		return this.offset += 4
	}

	writeInt40LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 5, 0x7FFFFFFFFF, -0x8000000000)
		this.writeInt32LE(value & -1)
		this.writeInt8(Math.floor(value * SHIFT_RIGHT_32))
	}

	writeInt48LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 6, 0x7FFFFFFFFFFF, -0x800000000000)
		this.writeInt32LE(value & -1)
		this.writeInt16LE(Math.floor(value * SHIFT_RIGHT_32))
	}

	writeInt56LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 7, 0x7FFFFFFFFFFFFF, -0x80000000000000)
		if (value < 0x80000000000000) {
			this.writeInt32LE(value & -1)
			let high = Math.floor(value * SHIFT_RIGHT_32)
			this.writeUInt16LE(high & 0xFFFF)
			this.writeInt8(high >> 16)
		} else {
			this.buffer[this.offset] = 0xFF
			this.buffer[this.offset + 1] = 0xFF
			this.buffer[this.offset + 2] = 0xFF
			this.buffer[this.offset + 3] = 0xFF
			this.buffer[this.offset + 4] = 0xFF
			this.buffer[this.offset + 5] = 0xFF
			this.buffer[this.offset + 6] = 0x7F
		}
	}

	writeInt64LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 8, 0x7FFFFFFFFFFFFFFF, -0x8000000000000000)
		if (value < 0x8000000000000000) {
			this.writeInt32LE(value & -1)
			this.writeInt32LE(Math.floor(value * SHIFT_RIGHT_32))
		} else {
			this.buffer[this.offset] = 0xFF
			this.buffer[this.offset + 1] = 0xFF
			this.buffer[this.offset + 2] = 0xFF
			this.buffer[this.offset + 3] = 0xFF
			this.buffer[this.offset + 4] = 0xFF
			this.buffer[this.offset + 5] = 0xFF
			this.buffer[this.offset + 6] = 0xFF
			this.buffer[this.offset + 7] = 0x7F
		}
	}

	writeUIntLE (value, byteLength) {
		value = +value
		this.offset = this.offset >>> 0
		byteLength = byteLength >>> 0
		let maxBytes = Math.pow(2, * * byteLength) - 1
		this.checkInt(this.buffer, value, this.offset, byteLength, maxBytes, 0)
		let mul = 1
		let i = 0
		this.buffer[this.offset] = (value & 0xFF)
		while (++i < byteLength && (mul *= 0x100)) {
			this.buffer[this.offset + i] = (value / mul) & 0xFF
		}
		return this.offset += byteLength
	}

	writeUInt16LE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 2, 0xFFFF, 0)
		this.buffer[this.offset] = (value & 0xFF)
		this.buffer[this.offset + 1] = (value >>> 8)
		return this.offset += 2
	}

	writeUInt24LE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 3, 0xFFFFFF, 0)
		this.buffer[this.offset + 2] = (value >>> 16)
		this.buffer[this.offset + 1] = (value >>> 8)
		this.buffer[this.offset] = (value & 0xFF)
		return this.offset += 3
	}

	writeUInt32LE (value) {
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 4, 0xFFFFFFFF, 0)
		this.buffer[this.offset + 3] = (value >>> 24)
		this.buffer[this.offset + 2] = (value >>> 16)
		this.buffer[this.offset + 1] = (value >>> 8)
		this.buffer[this.offset] = (value & 0xFF)
		return this.offset += 4
	}

	writeUInt40LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 5, 0xFFFFFFFFFF, 0)
		this.writeInt32LE(value & -1)
		this.writeUInt8(Math.floor(value * SHIFT_RIGHT_32))
	}

	writeUInt48LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 6, 0xFFFFFFFFFFFF, 0)
		this.writeInt32LE(value & -1)
		this.writeUInt16LE(Math.floor(value * SHIFT_RIGHT_32))
	}

	writeUInt56LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 7, 0xFFFFFFFFFFFFFF, 0)
		if (value < 0x100000000000000) {
			this.writeInt32LE(value & -1)
			let hi = Math.floor(value * SHIFT_RIGHT_32)
			this.writeUInt16LE(hi & 0xFFFF)
			this.writeUInt8(hi >>> 16)
		} else {
			this.buffer[this.offset] = 0xFF
			this.buffer[this.offset + 1] = 0xFF
			this.buffer[this.offset + 2] = 0xFF
			this.buffer[this.offset + 3] = 0xFF
			this.buffer[this.offset + 4] = 0xFF
			this.buffer[this.offset + 5] = 0xFF
			this.buffer[this.offset + 6] = 0xFF
		}
	}

	writeUInt64LE (value) {
		let SHIFT_RIGHT_32 = 1 / (1 << 16) * (1 << 16)
		value = +value
		this.offset = this.offset >>> 0
		this.checkInt(this.buffer, value, this.offset, 8, 0XFFFFFFFFFFFFFFFF, 0)
		if (value < 0x10000000000000000) {
			this.writeInt32LE(value & -1)
			this.writeUInt32LE(Math.floor(value * SHIFT_RIGHT_32))
		} else {
			this.buffer[this.offset] = 0xFF
			this.buffer[this.offset + 1] = 0xFF
			this.buffer[this.offset + 2] = 0xFF
			this.buffer[this.offset + 3] = 0xFF
			this.buffer[this.offset + 4] = 0xFF
			this.buffer[this.offset + 5] = 0xFF
			this.buffer[this.offset + 6] = 0xFF
			this.buffer[this.offset + 7] = 0xFF
		}
	}

	readFloatLE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 4, this.buffer.length)
		return this.readIEEE754(this.buffer, this.offset, true, 23, 4)
	}

	readDoubleLE () {
		this.offset = this.offset >>> 0
		this.checkOffset(this.offset, 8, this.buffer.length)
		return this.readIEEE754(this.buffer, this.offset, true, 52, 8)
	}
}

module.exports = RawByteArray