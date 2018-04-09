class RawSerializer {
	constructor (buff) {
		this.offset = 0
		if (buff instanceof RawSerializer) {
			this.buffer = buff.buffer
		} else if (buff instanceof Buffer) {
			this.buffer = buff
		} else {
			this.buffer = new Buffer(typeof (buff) === "number" ? Number(buff) : 1024)
		}
	}

	checkInt (buf, value, offset, ext, max, min) {
		if (!Buffer.isBuffer(buf)) {
			throw new TypeError('"buffer" argument must be a Buffer instance.')
		}
		if (value > max || value < min) {
			throw new RangeError('"value" argument is out of bounds.')
		}
		if (offset + ext > buf.length) {
			throw new RangeError('Index out of range.')
		}
	}

	write (value, isInt, typeInt, isBigEndian) {
		value = +value
		this.offset = this.offset >>> 0
		if (isInt) {
			if (isBigEndian) {
				if (typeInt === 8) {
					this.checkInt(this.buffer, value, this.offset, 1, 0x7f, -0x80)
					if (value < 0) {
						value = 0xFF + value + 1
					}
					this.buffer[this.offset++] = (value & 0xFF)
				} else if (typeInt === 16) {
					this.checkInt(this.buffer, value, this.offset, 2, 0x7fff, -0x8000)
					this.buffer[this.offset] = (value >>> 8)
					this.buffer[this.offset + 1] = (value & 0xFF)
					this.offset += 2
				} else if (typeInt === 24) {
					this.checkInt(this.buffer, value, this.offset, 3, 0x7fffff, -0x800000)
					this.buffer[this.offset] = (value >>> 16)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.buffer[this.offset + 2] = (value & 0xFF)
					this.offset += 3
				} else if (typeInt === 32) {
					this.checkInt(this.buffer, value, this.offset, 4, 0x7fffffff, -0x80000000)
					if (value < 0) {
						value = 0xFFFFFFFF + value + 1
					}
					this.buffer[this.offset] = (value >>> 24)
					this.buffer[this.offset + 1] = (value >>> 16)
					this.buffer[this.offset + 2] = (value >>> 8)
					this.buffer[this.offset + 3] = (value & 0xFF)
					this.offset += 4
				} else {
					throw "Unknown int type."
				}
			} else { // isLittleEndian
				if (typeInt === 16) {
					this.checkInt(this.buffer, value, this.offset, 2, 0x7fff, -0x8000)
					this.buffer[this.offset] = (value & 0xFF)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.offset += 2
				} else if (typeInt === 24) {
					this.checkInt(this.buffer, value, this.offset, 3, 0x7fffff, -0x800000)
					this.buffer[this.offset] = (value & 0xFF)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.buffer[this.offset + 2] = (value >>> 16)
					this.offset += 3
				} else if (typeInt === 32) {
					this.checkInt(this.buffer, value, this.offset, 4, 0x7fffffff, -0x80000000)
					this.buffer[this.offset] = (value & 0xFF)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.buffer[this.offset + 2] = (value >>> 16)
					this.buffer[this.offset + 3] = (value >>> 24)
					this.offset += 4
				} else {
					throw "Unknown int type."
				}
			}
		} else { // UInt
			if (isBigEndian) {
				if (typeInt === 8) {
					this.checkInt(this.buffer, value, this.offset, 1, 0xff, 0)
					this.buffer[this.offset++] = (value & 0xFF)
				} else if (typeInt === 16) {
					this.checkInt(this.buffer, value, this.offset, 2, 0xffff, 0)
					this.buffer[this.offset] = (value >>> 8)
					this.buffer[this.offset + 1] = (value & 0xFF)
					this.offset += 2
				} else if (typeInt === 24) {
					this.checkInt(this.buffer, value, this.offset, 3, 0xffffff, 0)
					this.buffer[this.offset] = (value >>> 16)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.buffer[this.offset + 2] = (value & 0xFF)
					this.offset += 3
				} else if (typeInt === 32) {
					this.checkInt(this.buffer, value, this.offset, 4, 0xffffffff, 0)
					this.buffer[this.offset] = (value >>> 24)
					this.buffer[this.offset + 1] = (value >>> 16)
					this.buffer[this.offset + 2] = (value >>> 8)
					this.buffer[this.offset + 3] = (value & 0xFF)
					this.offset += 4
				} else {
					throw "Unknown uint type."
				}
			} else { // isLittleEndian
				if (typeInt === 16) {
					this.checkInt(this.buffer, value, this.offset, 2, 0xffff, 0)
					this.buffer[this.offset] = (value & 0xFF)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.offset += 2
				} else if (typeInt === 24) {
					this.checkInt(this.buffer, value, this.offset, 3, 0xffffff, 0)
					this.buffer[this.offset + 2] = (value >>> 16)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.buffer[this.offset] = (value & 0xFF)
					this.offset += 3
				} else if (typeInt === 32) {
					this.checkInt(this.buffer, value, this.offset, 4, 0xffffffff, 0)
					this.buffer[this.offset + 3] = (value >>> 24)
					this.buffer[this.offset + 2] = (value >>> 16)
					this.buffer[this.offset + 1] = (value >>> 8)
					this.buffer[this.offset] = (value & 0xFF)
					this.offset += 4
				} else {
					throw "Unknown uint type."
				}
			}
		}
	}
}
module.exports = RawSerializer