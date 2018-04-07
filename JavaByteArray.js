"use strict"

class JavaByteArray {
	constructor (buff) {
		this.position = 0
		if (buff instanceof JavaByteArray) {
			this.buffer = buff.buffer
		} else if (buff instanceof Buffer) {
			this.buffer = buff
		} else {
			this.buffer = new Buffer(typeof (buff) === "number" ? Number(buff) : 1024)
		}
	}

	swapShort (value) {
		return (((value >> 0 & 0xFF) << 8) +
			   ((value >> 8 & 0xFF) << 0))
	}
	swapInteger (value) {
		return ((value >> 0 & 0xFF) << 24) +
		       ((value >> 8 & 0xFF) << 16) +
		       ((value >> 16 & 0xFF) << 8) +
		       ((value >> 24 & 0xFF) << 8)
	}
	swapLong (value) {
		return ((value >> 0 & 0xFF) << 56) +
		       ((value >> 8 & 0xFF) << 48) +
		       ((value >> 16 & 0xFF) << 40) +
		       ((value >> 24 & 0xFF) << 32) +
		       ((value >> 32 & 0xFF) << 24) +
		       ((value >> 40 & 0xFF) << 16) +
		       ((value >> 48 & 0xFF) << 8) +
		       ((value >> 56 & 0xFF) << 0)
	}

	writeSwappedShort (value) {
		this.buffer[this.position + 0] = (value >> 0 & 0xFF)
		this.buffer[this.position + 1] = (value >> 8 & 0xFF)
		this.position += 2
		return this
	}
	writeSwappedInteger (value) {
		this.buffer[this.position + 0] = (value >> 0 & 0xFF)
		this.buffer[this.position + 1] = (value >> 8 & 0xFF)
		this.buffer[this.position + 2] = (value >> 16 & 0xFF)
		this.buffer[this.position + 3] = (value >> 24 & 0xFF)
		this.position += 4
		return this
	}
	writeSwappedLong (value) {
		this.buffer[this.position + 0] = (value >> 0 & 0xFF)
		this.buffer[this.position + 1] = (value >> 8 & 0xFF)
		this.buffer[this.position + 2] = (value >> 16 & 0xFF)
		this.buffer[this.position + 3] = (value >> 24 & 0xFF)
		this.buffer[this.position + 4] = (value >> 32 & 0xFF)
		this.buffer[this.position + 5] = (value >> 40 & 0xFF)
		this.buffer[this.position + 6] = (value >> 48 & 0xFF)
		this.buffer[this.position + 7] = (value >> 56 & 0xFF)
		this.position += 8
		return this
	}

	readSwappedShort () {
		return (((this.buffer[this.position + 0] & 0xFF) << 0) +
			   ((this.buffer[this.position + 1] & 0xFF) << 8))
	}
	readSwappedInteger () {
		return ((this.buffer[this.position + 0] & 0xFF) << 0) +
		       ((this.buffer[this.position + 1] & 0xFF) << 8) +
		       ((this.buffer[this.position + 2] & 0xFF) << 16) +
		       ((this.buffer[this.position + 3] & 0xFF) << 24)
	}
	readSwappedLong () {
		let low = ((this.buffer[this.position + 0] & 0xFF) << 0) +
		          ((this.buffer[this.position + 1] & 0xFF) << 8) +
		          ((this.buffer[this.position + 2] & 0xFF) << 16) +
		          ((this.buffer[this.position + 3] & 0xFF) << 24)

		let high = ((this.buffer[this.position + 4] & 0xFF) << 0) +
		           ((this.buffer[this.position + 5] & 0xFF) << 8) +
		           ((this.buffer[this.position + 6] & 0xFF) << 16) +
		           ((this.buffer[this.position + 7] & 0xFF) << 24)
		return (high << 32) + (0xFFFFFFFF & low)
	}

	readSwappedUnsignedShort () {
		return ((this.buffer[this.position + 0] & 0xFF) << 0) +
		       ((this.buffer[this.position + 1] & 0xFF) << 8)
	}
	readSwappedUnsignedInteger () {
		let low = ((this.buffer[this.position + 0] & 0xFF) << 0) +
		          ((this.buffer[this.position + 1] & 0xFF) << 8) +
		          ((this.buffer[this.position + 2] & 0xFF) << 16)

		let high = this.buffer[this.position + 3] & 0xFF
		return (high << 24) + (0xFFFFFFFF & low)
	}
}

module.exports = JavaByteArray