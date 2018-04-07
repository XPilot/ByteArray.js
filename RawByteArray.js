"use strict"

class RawByteArray {
	constructor (buff) {
		this.position = 0
		if (buff instanceof RawByteArray) {
			this.buffer = buff.buffer
		} else if (buff instanceof Buffer) {
			this.buffer = buff
		} else {
			this.buffer = new Buffer(typeof (buff) === "number" ? Number(buff) : 1024)
		}
	}

	checkInt (value, offset, ext, max, min) {
	    if (!Buffer.isBuffer(this.buffer)) throw new TypeError('"buffer" argument must be a Buffer instance')
	    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	    if (offset + ext > this.buffer.length) throw new RangeError('Index out of range')
	}
    checkOffset (offset, ext, length) {
    	if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    	if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }

	writeInt8 (value) {
		value = Math.floor(value)
		this.checkInt(value, this.position, 1, 0x7f, -0x80)
		if (value < 0) {
			value = 0xFF + value + 1
		}
		this.buffer[this.position] = value & 0xFF
		this.position++
	}

	writeInt16BE (value) {
		value = Math.floor(value)
		this.checkInt(value, this.position, 2, 0x7fff, -0x8000)
		this.buffer[this.position] = value >> 8 & 0xFF
		this.buffer[this.position + 1] = value & 0xFF
		this.position += 2
	}

	writeInt24BE (value) {
		value = Math.floor(value)
		this.checkInt(value, this.position, 3, 0x7fffff, -0x800000)
		this.buffer[this.position] = value >> 16 & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.buffer[this.position + 2] = value & 0xFF
		this.position += 3
	}

	writeInt32BE (value) {
		value = Math.floor(value)
		this.checkInt(value, this.position, 4, 0x7fffffff, -0x80000000)
		if (value < 0) {
			value = 0xFFFFFFFF + value + 1
		}
		this.buffer[this.position] = value >> 24 & 0xFF
		this.buffer[this.position + 1] = value >> 16 & 0xFF
		this.buffer[this.position + 2] = value >> 8 & 0xFF
		this.buffer[this.position + 3] = value & 0xFF
		this.position += 4
	}

	writeString (value) {
		this.buffer.writeInt8(this.position += value.length)
		this.buffer.write(value, this.position, this.position, "utf8")
	}

	writeInt16LE (value) {
		value = Math.floor(value)
		this.checkInt(value, this.position, 2, 0x7fff, -0x8000)
		this.buffer[this.position] = value & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.position += 2
	}

	writeInt24LE (value) {
		value = Math.floor(value)
		this.checkInt(value, this.position, 3, 0x7fffff, -0x800000)
		this.buffer[this.position] = value & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.buffer[this.position + 2] = value >> 16 & 0xFF
		this.position += 3
	}

	writeInt32LE (value) {
		value = Math.floor(value)
		this.checkInt(value, this.position, 4, 0x7fffffff, -0x80000000)
		this.buffer[this.position] = value & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.buffer[this.position + 2] = value >> 16 & 0xFF
		this.buffer[this.position + 3] = value >> 24 & 0xFF
		this.position += 4
	}

	readInt8 () {
		this.checkOffset(this.position, 1, this.buffer.length)
		if (!(this.buffer[this.position] & 0x80))
		return this.buffer[this.position]
	}

	readInt16BE () {
		this.checkOffset(this.position, 2, this.buffer.length)
		let val = this.buffer[this.position + 1] | this.buffer[this.position] << 8
		return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	readInt24BE () {
		this.checkOffset(this.position, 3, this.buffer.length)
		return (this.buffer[this.position] << 16) |
		       (this.buffer[this.position + 1] << 8) +
		       (this.buffer[this.position + 2])
	}

	readInt32BE () {
		this.checkOffset(this.position, 4, this.buffer.length)
		return (this.buffer[this.position] << 24) |
		       (this.buffer[this.position + 1] << 16) |
		       (this.buffer[this.position + 2] << 8) |
		       (this.buffer[this.position + 3])
	}

	readString () {
		this.position = this.buffer.readInt8(0, this.position++)
		let length = this.position
		return this.buffer.toString("utf8", this.position, this.position + length)
	}

	readInt16LE () {
		this.checkOffset(this.position, 2, this.buffer.length)
		let val = this.buffer[this.position] | this.buffer[this.position + 1] << 8
		return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	readInt24LE () {
		this.checkOffset(this.position, 3, this.buffer.length)
		return (this.buffer[this.position]) |
		       (this.buffer[this.position + 1] << 8) |
		       (this.buffer[this.position + 2] << 16)
	}

	readInt32LE () {
		this.checkOffset(this.position, 4, this.buffer.length)
		return (this.buffer[this.position]) |
		       (this.buffer[this.position + 1] << 8) |
		       (this.buffer[this.position + 2] << 16) |
		       (this.buffer[this.position + 3] << 24)
	}
}

module.exports = RawByteArray