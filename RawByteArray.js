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
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeInt8(high)
		this.writeUInt32BE(low)
	}

	writeInt48BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeInt16BE(high)
		this.writeUInt32BE(low)
	}

	writeInt56BE (value) {
		value = +value
		this.offset = this.offset >>> 0
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
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeInt32BE(high)
		this.writeUInt32BE(low)
	}

	writeIntString (value) {
		this.writeInt8(this.offset += value.length)
		this.buffer.write(value, this.offset, this.offset, "utf8")
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
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeUInt8(high)
		this.writeUInt32BE(low)
	}

	writeUInt48BE (value) {
		value = +value
		this.offset = this.offset >>> 0
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeUInt16BE(high)
		this.writeUInt32BE(low)
	}

	writeUInt56BE (value) {
		value = +value
		this.offset = this.offset >>> 0
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
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		this.writeUInt32BE(high)
		this.writeUInt32BE(low)
	}

	writeUIntString (value) {
		this.writeUInt8(this.offset += value.length)
		this.buffer.write(value, this.offset, this.offset, "utf8")
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

	readIntString () {
		this.offset = this.readInt8(0, this.offset++)
		let length = this.offset
		return this.buffer.toString("utf8", this.offset, this.offset + length)
	}

	readUIntString () {
		this.offset = this.readUInt8(0, this.offset++)
		let length = this.offset
		return this.buffer.toString("utf8", this.offset, this.offset + length)
	}
}