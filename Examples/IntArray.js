class IntArray {
	constructor (buff) {
		this.data = []
		this.offset = 0
		if (buff instanceof IntArray) {
			this.readData = buff.data
			this.readOffset = buff.offset
		}
	}

	writeInt8 (v) {
		return ((this.data[this.offset] = v) |
			   (this.offset += 1))
	}

	writeInt16 (v) {
		return ((this.data[this.offset] = v >>> 8) |
			   (this.data[this.offset + 1] = v) |
			   (this.offset += 2))
	}

	writeInt24 (v) {
		return ((this.data[this.offset] = v >>> 16) |
			   (this.data[this.offset + 1] = v >>> 8) |
			   (this.data[this.offset + 2] = v) |
			   (this.offset += 3))
	}

	writeInt32 (v) {
		return ((this.data[this.offset] = v >>> 24) |
			   (this.data[this.offset + 1] = v >>> 16) |
			   (this.data[this.offset + 2] = v >>> 8) |
			   (this.data[this.offset + 3] = v) |
			   (this.offset += 4))
	}

	writeInt40 (v) {
		let h = Math.floor(v / 0x100000000)
		let l = v - h * 0x100000000
		return (this.writeInt8(h) |
			   (this.writeInt32(l)))
	}

	writeInt48 (v) {
		let h = Math.floor(v / 0x100000000)
		let l = v - h * 0x100000000
		return (this.writeInt16(h) |
			   (this.writeInt32(l)))
	}

	writeInt56 (v) {
		let t = Math.floor(v / 0x100000000)
		let h = Math.floor(t / 0x10000)
		let m = t - h * 0x10000
		let l = v - t * 0x100000000
		return (this.writeInt8(h) |
			   (this.writeInt16(m)) |
			   (this.writeInt32(l)))
	}

	writeInt64 (v) {
		let h = Math.floor(v / 0x100000000)
		let l = v - h * 0x100000000
		return (this.writeInt32(h) |
			   (this.writeInt32(l)))
	}

	readInt8 () {
		return (this.readData[this.offset++])
	}

	readInt16 () {
		return (this.readData[this.offset + 1] |
			   (this.readData[this.offset] << 8) |
			   (this.offset += 2))
	}

	readInt24 () {
		let v = (this.readData[this.offset + 2] |
		        (this.readData[this.offset + 1] << 16) |
		        (this.readData[this.offset] << 8))
		this.offset += 3
		return v
	}

	readInt32 () {
		let v = (this.readData[this.offset + 3] |
		        (this.readData[this.offset + 2] << 24) |
		        (this.readData[this.offset + 1] << 16) |
		        (this.readData[this.offset] << 8))
		this.offset += 4
		return v
	}

	readInt40 () {
		let v = (this.readData[this.offset + 4] |
		        (this.readData[this.offset + 3] << 32) |
		        (this.readData[this.offset + 2] << 24) |
		        (this.readData[this.offset + 1] << 16) |
		        (this.readData[this.offset] << 8))
		this.offset += 5
		return v
	}

	readInt48 () {
		let v = (this.readData[this.offset + 5] |
		        (this.readData[this.offset + 4] << 40) |
		        (this.readData[this.offset + 3] << 32) |
		        (this.readData[this.offset + 2] << 24) |
		        (this.readData[this.offset + 1] << 16) |
		        (this.readData[this.offset] << 8))
		this.offset += 6
		return v
	}

	readInt56 () {
		let v = (this.readData[this.offset + 6] |
		        (this.readData[this.offset + 5] << 48) |
		        (this.readData[this.offset + 4] << 40) |
		        (this.readData[this.offset + 3] << 32) |
		        (this.readData[this.offset + 2] << 24) |
		        (this.readData[this.offset + 1] << 16) |
		        (this.readData[this.offset] << 8))
		this.offset += 7
		return v
	}

	readInt64 () {
		let v = (this.readData[this.offset + 7] |
		        (this.readData[this.offset + 6] << 56) |
		        (this.readData[this.offset + 5] << 48) |
		        (this.readData[this.offset + 4] << 40) |
		        (this.readData[this.offset + 3] << 32) |
		        (this.readData[this.offset + 2] << 24) |
		        (this.readData[this.offset + 1] << 16) |
		        (this.readData[this.offset] << 8))
		this.offset += 8
		return v
	}
}

module.exports = IntArray