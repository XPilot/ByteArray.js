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

	writeInt8 (value) {
		value = Math.floor(value)
		if (value > 255) {
			throw new Error('Int8 out of bound. Current value: ' + value)
		}
		this.buffer[this.position] = value & 0xFF
		this.position++
	}

	writeInt16BE (value) {
		value = Math.floor(value)
		if (value > 65535) {
			throw new Error('Int16BE out of bound. Current value: ' + value)
		}
		this.buffer[this.position] = value >> 8 & 0xFF
		this.buffer[this.position + 1] = value & 0xFF
		this.position += 2
	}

	writeInt24BE (value) {
		value = Math.floor(value)
		if (value > 16777215) {
			throw new Error('Int24BE out of bound. Current value: ' + value)
		}
		this.buffer[this.position] = value >> 16 & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.buffer[this.position + 2] = value & 0xFF
		this.position += 3
	}

	writeInt32BE (value) {
		value = Math.floor(value)
		if (value > 2147483647) {
			throw new Error('Int32BE out of bound. Current value: ' + value)
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
		if (value > 65535) {
			throw new Error('Int16LE out of bound. Current value: ' + value)
		}
		this.buffer[this.position] = value & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.position += 2
	}

	writeInt24LE (value) {
		value = Math.floor(value)
		if (value > 16777215) {
			throw new Error('Int24LE out of bound. Current value: ' + value)
		}
		this.buffer[this.position] = value & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.buffer[this.position + 2] = value >> 16 & 0xFF
		this.position += 3
	}

	writeInt32LE (value) {
		value = Math.floor(value)
		if (value > 2147483647) {
			throw new Error('Int32LE out of bound. Current value: ' + value)
		}
		this.buffer[this.position] = value & 0xFF
		this.buffer[this.position + 1] = value >> 8 & 0xFF
		this.buffer[this.position + 2] = value >> 16 & 0xFF
		this.buffer[this.position + 3] = value >> 24 & 0xFF
		this.position += 4
	}

	readInt8 () {
		return this.buffer[this.position]
	}

	readInt16BE () {
		return this.buffer[this.position] << 8 | this.buffer[this.position + 1]
	}

	readInt24BE () {
		return this.buffer[this.position] << 16 | this.buffer[this.position + 1] << 8 | this.buffer[this.position + 2]
	}

	readInt32BE () {
		return this.buffer[this.position] << 24 | this.buffer[this.position + 1] << 16 | this.buffer[this.position + 2] << 8 | this.buffer[this.position + 3]
	}

	readString () {
		this.position = this.buffer.readInt8(0, this.position++)
		let length = this.position
		return this.buffer.toString("utf8", this.position, this.position + length)
	}

	readInt16LE () {
		return this.buffer[this.position] | this.buffer[this.position + 1] << 8
	}

	readInt24LE () {
		return this.buffer[this.position] | this.buffer[this.position + 1] << 8 | this.buffer[this.position + 2] << 16
	}

	readInt32LE () {
		return this.buffer[this.position] | this.buffer[this.position + 1] << 8 | this.buffer[this.position + 2] << 16 | this.buffer[this.position + 3] << 24
	}
}

module.exports = RawByteArray