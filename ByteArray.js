"use strict"

const Values = { // Values to fit offset
	Int8: 1,
	DoubleBE: 8,
	FloatBE: 4,
	Int32BE: 4,
	Int16BE: 2
}

class NumberUtils {
	static NumberEncode (ToEncodeNumber) {
		if (ToEncodeNumber < 0)
			return 0x00
		else if (ToEncodeNumber < 26)
			return 0x41 + ToEncodeNumber
		else if (ToEncodeNumber < 52)
			return 0x61 + (ToEncodeNumber - 26)
		else if (ToEncodeNumber < 62)
			return 0x30 + (ToEncodeNumber - 52)
		else if (ToEncodeNumber == 62)
			return 0x2b
		else if (ToEncodeNumber == 63)
			return 0x2f
	}

	static NumberDecode (ToDecodeNumber) {
		if (0x41 <= ToDecodeNumber && ToDecodeNumber <= 0x5a)
			return ToDecodeNumber - 0x41
		else if (0x61 <= ToDecodeNumber && ToDecodeNumber <= 0x7a)
			return ToDecodeNumber - 0x61 + 26
		else if (0x30 <= ToDecodeNumber && ToDecodeNumber <= 0x39)
			return ToDecodeNumber - 0x30 + 52
		else if (ToDecodeNumber == 0x2b)
			return 62
		else if (ToDecodeNumber == 0x2f)
			return 63
	}
}

class ByteArray {
	constructor (buff) {
		this.offset = 0
		this.byteLength = this.offset || 0
		if (buff instanceof ByteArray) { // If the parameters type is ByteArray
			this.buffer = buff.buffer // Handle it as a new instance to READ
		} else if (buff instanceof Buffer) {
			this.buffer = buff
		} else {
			this.buffer = new Buffer(typeof (buff) === "number" ? Number(buff) : 1024)
		}
	}

	get position () {
		return this.offset // Returns current offset
	}

	set position (value) {
		this.offset = value // Sets current offset to "value"
	}

	get length () {
		return this.buffer.length // Returns current byte stream length
	}

	set length (value) {
		this.buffer.length = value // Sets current byte stream to "length"
	}

	get bytesAvailable () {
		return this.length - this.offset // Returns 4096 - the offset
	}

	toJSON () {
		return this.buffer.toJSON() // Returns JSON'd byte stream
	}

	toString () {
		return this.buffer.toString("utf8", this.offset, this.length) // Returns stringified byte stream
	}

	reset () {
		this.offset = 0 // Sets current offset to 0
	}

	clear () {
		this.length(4096) // Clears byte stream with new empty bytes
	}

	range (length) { // Variant of lodash
		return Array.from({length: length}, (x,i) => i)
	}

	updatePosition (n) { // Clean way of setting position correctly
		let a = this.offset
		this.offset += n
		return a
	}

	readBoolean () {
		return Boolean(this.buffer.readInt8(this.updatePosition(Values.Int8)) & 0xFF) ? true : false // Converts to Boolean
	}

	readByte () {
		return this.buffer.readInt8(this.updatePosition(Values.Int8))
	}

	readBytes (bytes, offset = 0, length = 0) {
		if (offset == 0 || length == 0)
			offset = 0
		    length = 0
		if (offset < 0 || length < 0)
			return
		length = length || bytes.length
		offset = offset || 0
		for (var i = offset; i < length; i++) {
			bytes.writeByte(this.readByte())
		}
	}

	readDouble () {
		return this.buffer.readDoubleBE(this.updatePosition(Values.DoubleBE))
	}

	readFloat () {
		return this.buffer.readFloatBE(this.updatePosition(Values.FloatBE))
	}

	readInt () {
		return this.buffer.readInt32BE(this.updatePosition(Values.Int32BE))
	}

	readMultiByte (length) {
		let offset = this.updatePosition(length)
		return this.buffer.toString("utf8", offset, offset + length)
	}

	readShort () {
		return this.buffer.readInt16BE(this.updatePosition(Values.Int16BE))
	}

	readUnsignedByte () {
		return this.buffer.readUInt8(this.updatePosition(Values.Int8))
	}

	readUnsignedInt () {
		return this.buffer.readUInt32BE(this.updatePosition(Values.Int32BE))
	}

	readUnsignedShort () {
		return this.buffer.readUInt16BE(this.updatePosition(Values.Int16BE))
	}

	readUTF () {
		let length = this.readByte() // Reads the length of the written UTF string
		return this.buffer.toString("utf8", this.offset, this.offset + length)
	}

	readUTFBytes (length) {
		let offset = this.updatePosition(length)
		return this.buffer.toString("utf8", offset, offset + length)
	}

	readDate () {
		let date = new Date()
		date.setSeconds(this.buffer.readInt8(0))
		date.setMinutes(this.buffer.readInt8(1))
		date.setHours(this.buffer.readInt8(2) + 2) // Amsterdam time
		date.setDate(this.buffer.readInt8(3))
		date.setMonth(this.buffer.readInt8(5) - 1)
		date.setFullYear(this.buffer.readUInt16BE(6))
		return date
	}

	readChar () {
		return String.fromCharCode(this.buffer[this.offset++]) // Only reads one byte <Buffer 00>
	}

	/*
	"length" stands for the amount of bytes in the byte stream to read.
	writeByteArray([2,3]) => <Buffer 02 03 00 00 00...> <= Length is 2.
	writeShortArray([2,3]) => <Buffer 00 02 00 03 00...> <= Length is 2.
	*/

	readByteArray (length) {
		return new Int8Array(this.range(length).map(() => this.readByte()))
	}

	readShortArray (length) {
		return new Int16Array(this.range(length).map(() => this.readShort()))
	}

	readIntArray (length) {
		return new Int32Array(this.range(length).map(() => this.readInt()))
	}

	readCharArray (length) {
		return new Array(this.range(length).map(() => this.readChar()))
	}

	writeBoolean (value) {
		return this.buffer.writeInt8(Number(value), this.updatePosition(Values.Int8))
	}

	writeByte (value) {
		return this.buffer.writeInt8(value, this.updatePosition(Values.Int8))
	}

	writeBytes (bytes, offset = 0, length = 0) {
		if (offset == 0 || length == 0)
			offset = 0
		    length = 0
		if (offset < 0 || length < 0)
			return
		length = length || bytes.length
		offset = offset || 0
		for (var i = offset; i < length && this.bytesAvailable > 0; i++) {
			this.writeByte(bytes.readByte())
		}
	}

	writeDouble (value) {
		return this.buffer.writeDoubleBE(value, this.updatePosition(Values.DoubleBE))
	}

	writeFloat (value) {
		return this.buffer.writeFloatBE(value, this.updatePosition(Values.FloatBE))
	}

	writeInt (value) {
		return this.buffer.writeInt32BE(value, this.updatePosition(Values.Int32BE))
	}

	writeMultiByte (str) {
		let length = Buffer.byteLength(str)
		return this.buffer.write(str, this.updatePosition(length), length, "utf8")
	}

	writeShort (value) {
		return this.buffer.writeInt16BE(value, this.updatePosition(Values.Int16BE))
	}

	writeUnsignedByte (value) {
		return this.buffer.writeUInt8(value, this.updatePosition(Values.Int8))
	}

	writeUnsignedInt (value) {
		return this.buffer.writeUInt32BE(value, this.updatePosition(Values.Int32BE))
	}

	writeUnsignedShort (value) {
		return this.buffer.writeUInt16BE(value, this.updatePosition(Values.Int16BE))
	}

	writeUTF (str) {
		let length = Buffer.byteLength(str)
		this.writeByte(length) // Writes the length of the value to the byte stream to use for reading
		return this.buffer.write(str, this.offset, this.offset += length, "utf8")
	}

	writeUTFBytes (str) {
		let length = Buffer.byteLength(str)
		return this.buffer.write(str, this.offset, this.offset += length)
	}

	writeDate (date) {
		this.buffer.writeInt8(date.getSeconds(), 0)
		this.buffer.writeInt8(date.getMinutes(), 1)
		this.buffer.writeInt8(date.getHours(), 2)
		this.buffer.writeInt8(date.getDate(), 3)
		this.buffer.writeInt8(date.getDay(), 4)
		this.buffer.writeInt8(date.getMonth() + 1, 5)
		return this.buffer.writeUInt16BE(date.getFullYear(), 6)
	}

	writeChar (value) {
		return this.writeUnsignedByte(value.charCodeAt(0))
	}

	writeByteArray (values) {
		if (!Array.isArray(values)) throw new TypeError("Expected an array of bytes")
		values.forEach(value => {
			this.writeByte(value)
		})
	}

	writeShortArray (values) {
		if (!Array.isArray(values)) throw new TypeError("Expected an array of bytes")
		values.forEach(value => {
			this.writeShort(value)
		})
	}

	writeIntArray (values) {
		if (!Array.isArray(values)) throw new TypeError("Expected an array of bytes")
		values.forEach(value => {
			this.writeInt(value)
		})
	}

	writeCharArray (values) {
		if (!Array.isArray(values)) throw new TypeError("Expected an array of bytes")
		values.forEach(value => {
			this.writeChar(value)
		})
	}

	/*
	Some AMF functions.
	*/

	writeUnsignedInt29 (value) {
		if (128 > value) {
			this.writeByte(value)
		} else if (16384 > value) {
		    this.writeByte(value >> 7 & 127 | 128)
			this.writeByte(value & 127)
		} else if (2097152 > value) {
			this.writeByte(value >> 14 & 127 | 128)
			this.writeByte(value >> 7 & 127 | 128)
			this.writeByte(value & 127)
		} else if (1073741824 > value) {
			this.writeByte(value >> 22 & 127 | 128)
			this.writeByte(value >> 15 & 127 | 128)
			this.writeByte(value >> 8 & 127 | 128)
			this.writeByte(value & 255)
		} else {
			throw new RangeError("Integer out of range: " + value)
		}
	}

	writeInt29 (value) {
		if (value != undefined) {
			if (value < -0x10000000 || value > 0x0FFFFFFF) {
				throw new Error("Integer must be between -0x10000000 and 0x0FFFFFFF but got " + value + " instead")
			}
			value += value < 0 ? 0x20000000 : 0
			let tmp = undefined
			if (value > 0x1FFFFF) {
				tmp = value
				value >>= 1
				this.writeUnsignedByte(0x80 | ((value >> 21) & 0xFF))
			}
			if (value > 0x3FFF) {
				this.writeUnsignedByte(0x80 | ((value >> 14) & 0xFF))
			}
			if (value > 0x7F) {
				this.writeUnsignedByte(0x80 | ((value >> 7) & 0xFF))
			}
			if (tmp != undefined) {
				value = tmp
			}
			if (value > 0x1FFFFF) {
				this.writeUnsignedByte(value & 0xFF)
			} else {
				this.writeUnsignedByte(value & 0x7F)
			}
		}
	}
	
	readUnsignedInt29 () {
		let b = this.readByte() & 255
		if (b < 127)
			return b
		let value = (b & 127) << 7
		b = this.readByte() & 255
		if (b < 128)
			return (value | b)
		value = (value | (b & 127)) << 7
		b = this.readByte() & 255
		if (b < 128)
			return (value | b)
		value = (value | (b & 127)) << 8
		b = this.readByte() & 255
		return (value | b)
	}

	readInt29 () {
		let data = this.readUnsignedByte() & 255
		if (data & 128) {
			data = (data ^128) <<7
			let d = this.readUnsignedByte() & 255
			if (d & 128) {
				data = (data|(d ^ 128)) <<7
				d = this.readUnsignedByte() & 255
				if (d & 128) {
					data = (data|(d ^ 128)) <<8
					d = this.readUnsignedByte() & 255
					data |= d
					if (data & 0x10000000) {
						data |= 0xe0000000
					}
				} else {
					data |= d
				}
			} else {
				data |= d
			}
		}
		return data
	}
}

module.exports = {
	ByteArray,
	NumberUtils
}
