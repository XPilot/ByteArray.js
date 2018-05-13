"use strict"

const AMF0 = require("./AMF0")

const Values = {
	Int8: 1,
	Double: 8,
	Float: 4,
	Int32: 4,
	Int16: 2,
	MAX_BUFFER_SIZE: 4096,
	BIG_ENDIAN: true,
	LITTLE_ENDIAN: false,
	AMF_0: "0",
	AMF_3: "3"
}

class ByteArray {
	constructor (buff) {
		this.offset = 0
		this.byteLength = this.offset || 0
		this.endian = Values.BIG_ENDIAN
		this._objectEncoding = Values.AMF_0
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

	get objectEncoding () {
		return this._objectEncoding
	}
	set objectEncoding (AMFV) {
		if (AMFV > 3 || AMFV < 0 || AMFV === 2 || AMFV === 3) {
			throw new TypeError("Invalid AMF version or not supported yet")
		}
		this._objectEncoding = String(AMFV)
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
		return Boolean(this.buffer.readInt8(this.updatePosition(Values.Int8)) & 0xFF)
	}

	readByte () {
		return this.buffer.readInt8(this.updatePosition(Values.Int8))
	}

	readBytes (bytes, offset = 0, length = 0) {
		if (offset === undefined) {
			offset = 0
		}
		if (length === undefined || length === 0) {
			length = this.bytesAvailable
		}
		let endOffset = offset + length
		for (let i = offset; i < endOffset; i++) {
			bytes[i] = this.readByte()
			console.log(bytes[i])
		}
	}

	readDouble () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readDoubleBE(this.updatePosition(Values.Double))
		: this.buffer.readDoubleLE(this.updatePosition(Values.Double))
	}

	readFloat () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readFloatBE(this.updatePosition(Values.Float))
		: this.buffer.readFloatLE(this.updatePosition(Values.Float))
	}

	readInt () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readInt32BE(this.updatePosition(Values.Int32))
		: this.buffer.readInt32LE(this.updatePosition(Values.Int32))
	}

	readMultiByte (length, charset) { /* ascii, utf8, utf16le, ucs2, base64, latin1, binary, hex */
		let offset = this.updatePosition(length)
		return this.buffer.toString(charset || "utf8", offset, offset + length)
	}

	readShort () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readInt16BE(this.updatePosition(Values.Int16))
		: this.buffer.readInt16LE(this.updatePosition(Values.Int16))
	}

	readUnsignedByte () {
		return this.buffer.readUInt8(this.updatePosition(Values.Int8))
	}

	readUnsignedInt () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readUInt32BE(this.updatePosition(Values.Int32))
		: this.buffer.readUInt32LE(this.updatePosition(Values.Int32))
	}

	readUnsignedShort () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readUInt16BE(this.updatePosition(Values.Int16))
		: this.buffer.readUInt16LE(this.updatePosition(Values.Int16))
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
		if (offset === undefined || offset < 0 || offset >= bytes.length) {
			offset = 0
		}
		let endOffset
		if (length === undefined || length === 0) {
			endOffset = bytes.length
		} else {
			endOffset = offset + length
			if (endOffset < 0 || endOffset > bytes.length) {
				endOffset = bytes.length
			}
		}
		if (Array.isArray(bytes)) {
			for (let i = 0; i < bytes.length; i++) {
				this.writeByte(bytes[i])
			}
		} else {
			for (let i = offset; i < endOffset && this.bytesAvailable > 0; i++) {
				this.writeByte(bytes[i])
			}
		}
	}

	writeDouble (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeDoubleBE(value, this.updatePosition(Values.Double))
		: this.buffer.writeDoubleLE(value, this.updatePosition(Values.Double))
	}

	writeFloat (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeFloatBE(value, this.updatePosition(Values.Float))
		: this.buffer.writeFloatLE(value, this.updatePosition(Values.Float))
	}

	writeInt (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeInt32BE(value, this.updatePosition(Values.Int32))
		: this.buffer.writeInt32LE(value, this.updatePosition(Values.Int32))
	}

	writeMultiByte (str, charset) { /* ascii, utf8, utf16le, ucs2, base64, latin1, binary, hex */
		let length = Buffer.byteLength(str)
		return this.buffer.write(str, this.updatePosition(length), length, charset || "utf8")
	}

	writeShort (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeInt16BE(value, this.updatePosition(Values.Int16))
		: this.buffer.writeInt16LE(value, this.updatePosition(Values.Int16))
	}

	writeUnsignedByte (value) {
		return this.buffer.writeUInt8(value, this.updatePosition(Values.Int8))
	}

	writeUnsignedInt (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeUInt32BE(value, this.updatePosition(Values.Int32))
		: this.buffer.writeUInt32LE(value, this.updatePosition(Values.Int32))
	}

	writeUnsignedShort (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeUInt16BE(value, this.updatePosition(Values.Int16))
		: this.buffer.writeUInt16LE(value, this.updatePosition(Values.Int16))
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
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes")
		}
		values.forEach(value => {
			this.writeByte(value)
		})
	}

	writeShortArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes")
		}
		values.forEach(value => {
			this.writeShort(value)
		})
	}

	writeIntArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes")
		}
		values.forEach(value => {
			this.writeInt(value)
		})
	}

	writeCharArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes")
		}
		values.forEach(value => {
			this.writeChar(value)
		})
	}

	writeObject (object) {
		if (this.objectEncoding === "0") {
			let amf = new AMF0()
			let serializedObject = amf.writeObject(object)
			console.log("AMF0 Serialized Buffer:", serializedObject)
			this.buffer = serializedObject
		} else {
			throw new TypeError("Not supported yet")
		}
	}

	readObject (buffer) {
		if (this.objectEncoding === "0") {
			let amf = new AMF0()
			let deserializedObject = amf.readObject(buffer)
			console.log("AMF0 Deserialized Buffer:", deserializedObject)
		} else {
			throw new TypeError("Not supported yet")
		}
	}
}

module.exports = ByteArray