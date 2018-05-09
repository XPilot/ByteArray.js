"use strict"

const Values = {
	Int8: 1,
	Double: 8,
	Float: 4,
	Int32: 4,
	Int16: 2,
	MAX_BUFFER_SIZE: 4096
}

class ByteArray {
	constructor (buff) {
		this.offset = 0
		this.byteLength = this.offset || 0
		if (buff instanceof ByteArray) {
			this.buffer = buff.buffer
		} else if (buff instanceof Buffer) {
			this.buffer = buff
		} else {
			this.buffer = new Buffer(typeof (buff) === "number" ? Number(buff) : Values.MAX_BUFFER_SIZE)
		}
	}

	get position () {
		return this.offset
	}
	get length () {
		return this.buffer.length
	}
	get bytesAvailable () {
		return this.length - this.offset
	}

	set position (value) {
		this.offset = value
	}
	set length (value) {
		this.buffer.length = value
	}

	toJSON () {
		return this.buffer.toJSON()
	}
	toString () {
		return this.buffer.toString("utf8", this.offset, this.length)
	}

	reset () {
		this.offset = 0
	}
	clear () {
		this.length(Values.MAX_BUFFER_SIZE)
	}

	range (length) {
		return Array.from({length: length}, (x,i) => i)
	}

	updatePosition (n) {
		let a = this.offset
		this.offset += n
		return a
	}

	readBoolean () {
		return Boolean(this.buffer.readInt8(this.updatePosition(Values.Int8)) & 0xFF) ? true : false
	}

	readByte () {
		return this.buffer.readInt8(this.updatePosition(Values.Int8))
	}

	readBytes (bytes, offset = 0, length = 0) {
		if (bytes == undefined) {
			return
		}
		if (offset < 0 || length < 0) {
			return
		}
		if (offset == 0 || length == 0) {
			offset = 0
			length = 0
		}
		length = length || bytes.length
		offset = offset || 0
		for (var i = offset; i < length; i++) {
			bytes.writeByte(this.readByte())
		}
	}

	readDouble () {
		return this.buffer.readDoubleBE(this.updatePosition(Values.Double))
	}

	readFloat () {
		return this.buffer.readFloatBE(this.updatePosition(Values.Float))
	}

	readInt () {
		return this.buffer.readInt32BE(this.updatePosition(Values.Int32))
	}

	readMultiByte (length, charset) { /* ascii, utf8, utf16le, ucs2, base64, latin1, binary, hex */
		let offset = this.updatePosition(length)
		return this.buffer.toString(charset || "utf8", offset, offset + length)
	}

	readShort () {
		return this.buffer.readInt16BE(this.updatePosition(Values.Int16))
	}

	readUnsignedByte () {
		return this.buffer.readUInt8(this.updatePosition(Values.Int8))
	}

	readUnsignedInt () {
		return this.buffer.readUInt32BE(this.updatePosition(Values.Int32))
	}

	readUnsignedShort () {
		return this.buffer.readUInt16BE(this.updatePosition(Values.Int16))
	}

	readUTF () {
		let length = this.readByte()
		return this.buffer.toString("utf8", this.offset, this.offset + length)
	}

	readUTFBytes (length) {
		let offset = this.updatePosition(length)
		return this.buffer.toString("utf8", offset, offset + length)
	}

	readChar () {
		return String.fromCharCode(this.buffer[this.offset++])
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
		if (bytes == undefined) {
			return
		}
		if (offset < 0 || length < 0) {
			return
		}
		if (offset == 0 || length == 0) {
			offset = 0
			length = 0
		}
		length = length || bytes.length
		offset = offset || 0
		for (var i = offset; i < length && this.bytesAvailable > 0; i++) {
			this.writeByte(bytes.readByte())
		}
	}

	writeDouble (value) {
		return this.buffer.writeDoubleBE(value, this.updatePosition(Values.Double))
	}

	writeFloat (value) {
		return this.buffer.writeFloatBE(value, this.updatePosition(Values.Float))
	}

	writeInt (value) {
		return this.buffer.writeInt32BE(value, this.updatePosition(Values.Int32))
	}

	writeMultiByte (str, charset) { /* ascii, utf8, utf16le, ucs2, base64, latin1, binary, hex */
		let length = Buffer.byteLength(str)
		return this.buffer.write(str, this.updatePosition(length), length, charset || "utf8")
	}

	writeShort (value) {
		return this.buffer.writeInt16BE(value, this.updatePosition(Values.Int16))
	}

	writeUnsignedByte (value) {
		return this.buffer.writeUInt8(value, this.updatePosition(Values.Int8))
	}

	writeUnsignedInt (value) {
		return this.buffer.writeUInt32BE(value, this.updatePosition(Values.Int32))
	}

	writeUnsignedShort (value) {
		return this.buffer.writeUInt16BE(value, this.updatePosition(Values.Int16))
	}

	writeUTF (str) {
		let length = Buffer.byteLength(str)
		this.writeByte(length)
		return this.buffer.write(str, this.offset, this.offset += length, "utf8")
	}

	writeUTFBytes (str) {
		let length = Buffer.byteLength(str)
		return this.buffer.write(str, this.offset, this.offset += length, "utf8")
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
}

module.exports = ByteArray