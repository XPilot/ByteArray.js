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

/** Class representing a ByteArray. */
class ByteArray {
	/**
	 * Create a ByteArray.
	 * @param {buffer} buff - Custom length or another ByteArray to read from.
	 */
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 3e15fe61bac8105491b240a06b0e56bf16dba4b1
	/**
	 * Validates string.
	 * @param {string} value
	 * @returns {string/null}
	 */
	axCoerceString (value) {
		if (typeof value === "string") {
			return value
		} else if (value == undefined) {
			return null
		}
		return value + ""
	}
<<<<<<< HEAD
=======
=======

>>>>>>> 12877aa487f1da20c6596929f1c636df3b6b2a02
>>>>>>> 3e15fe61bac8105491b240a06b0e56bf16dba4b1
	/**
	 * Returns the position.
	 * @returns {number}
	 */
	get position () {
		return this.offset
	}
	/**
	 * Returns the buffer length.
	 * @returns {number}
	 */
	get length () {
		return this.buffer.length
	}
	/**
	 * Returns the buffer length minus the position.
	 * @returns {number}
	 */
	get bytesAvailable () {
		return this.length - this.offset
	}
	/**
	 * Sets the position to value.
	 * @param {number} value
	 */
	set position (value) {
		this.offset = value
	}
	/**
	 * Sets the length of the buffer to value.
	 * @param {number} value
	 */
	set length (value) {
		this.buffer.length = value
	}
	/**
	 * Returns the AMF version.
	 * @returns {string}
	 */
	get objectEncoding () {
		return this._objectEncoding
	}
	/**
	 * Currently only supporting AMF 0.
	 * Sets the AMF version to AMFV.
	 * @param {string} AMFV
	 */
	set objectEncoding (AMFV) {
<<<<<<< HEAD
		AMFV = this.axCoerceString(AMFV)
		if (AMFV == "0" && typeof AMFV === "string") {
=======
<<<<<<< HEAD
		AMFV = this.axCoerceString(AMFV)
		if (AMFV == "0" && typeof AMFV === "string") {
=======
		if (AMFV === 0) {
>>>>>>> 12877aa487f1da20c6596929f1c636df3b6b2a02
>>>>>>> 3e15fe61bac8105491b240a06b0e56bf16dba4b1
			this._objectEncoding = String(AMFV)
		} else {
			throw new TypeError("Invalid AMF version or not supported yet")
		}
	}
	/**
	 * Returns a JSON formatted buffer.
	 * @returns {json}
	 */
	toJSON () {
		return this.buffer.toJSON()
	}
	/**
	 * Returns a UTF8 decoded buffer.
	 * @returns {string}
	 */
	toString () {
		return this.buffer.toString("utf8", this.offset, this.length)
	}
	/**
	 * Resets the position to 0.
	 */
	reset () {
		this.offset = 0
	}
	/**
	 * Clears the buffer with 4096 zeros.
	 */
	clear () {
		this.length(Values.MAX_BUFFER_SIZE)
	}
	/**
	 * Returns a range within the supplied bounds.
	 * @param {number} length
	 * @returns {array}
	 */
	range (length) {
		return Array.from({length: length}, (x,i) => i)
	}
	/**
	 * Updates the position.
	 * @param {number} n
	 * @returns {number}
	 */
	updatePosition (n) {
		let a = this.offset
		this.offset += n
		return a
	}
	/**
	 * Reads a boolean from the byte stream.
	 * @returns {boolean}
	 */
	readBoolean () {
		return Boolean(this.buffer.readInt8(this.updatePosition(Values.Int8)) & 0xFF)
	}
	/**
	 * Reads a signed byte from the byte stream.
	 * @returns {number}
	 */
	readByte () {
		return this.buffer.readInt8(this.updatePosition(Values.Int8))
	}
	/**
	 * Reads the number of data bytes, specified by the length parameter, from the byte stream.
	 * The bytes are read into the ByteArray object specified by the bytes parameter,
	 * and the bytes are written into the destination ByteArray starting at the position specified by offset.
	 * @param {bytearray} bytes
	 * @param {number} offset
	 * @param {number} length
	 * @returns {number}
	 */
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
	/**
	 * Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
	 * @returns {number}
	 */
	readDouble () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readDoubleBE(this.updatePosition(Values.Double))
		: this.buffer.readDoubleLE(this.updatePosition(Values.Double))
	}
	/**
	 * Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
	 * @returns {number}
	 */
	readFloat () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readFloatBE(this.updatePosition(Values.Float))
		: this.buffer.readFloatLE(this.updatePosition(Values.Float))
	}
	/**
	 * Reads a signed 32-bit integer from the byte stream.
	 * @returns {number}
	 */
	readInt () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readInt32BE(this.updatePosition(Values.Int32))
		: this.buffer.readInt32LE(this.updatePosition(Values.Int32))
	}
	/**
	 * Reads a multibyte string of specified length from the byte stream using the specified character set.
	 * @param {number} length
	 * @param {string} charset
	 * @returns {string}
	 */
	readMultiByte (length, charset) { /* ascii, utf8, utf16le, ucs2, base64, latin1, binary, hex */
		charset = this.axCoerceString(charset)
		let offset = this.updatePosition(length)
		return this.buffer.toString(charset || "utf8", offset, offset + length)
	}
	/**
	 * Reads an object from the byte array, encoded in AMF serialized format.
	 * @returns {object}
	 */
	 readObject (buffer) {
	 	if (this.objectEncoding === "0") {
	 		let amf = new AMF0()
	 		let deserializedObject = amf.readObject(buffer)
	 		console.log("AMF0 Deserialized Buffer:", deserializedObject)
	 	} else {
	 		throw new TypeError("Not supported yet")
	 	}
	 }
	/**
	 * Reads a signed 16-bit integer from the byte stream.
	 * @returns {number}
	 */
	readShort () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readInt16BE(this.updatePosition(Values.Int16))
		: this.buffer.readInt16LE(this.updatePosition(Values.Int16))
	}
	/**
	 * Reads an unsigned byte from the byte stream.
	 * @returns {number}
	 */
	readUnsignedByte () {
		return this.buffer.readUInt8(this.updatePosition(Values.Int8))
	}
	/**
	 * Reads an unsigned 32-bit integer from the byte stream.
	 * @returns {number}
	 */
	readUnsignedInt () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readUInt32BE(this.updatePosition(Values.Int32))
		: this.buffer.readUInt32LE(this.updatePosition(Values.Int32))
	}
	/**
	 * Reads an unsigned 16-bit integer from the byte stream.
	 * @returns {number}
	 */
	readUnsignedShort () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readUInt16BE(this.updatePosition(Values.Int16))
		: this.buffer.readUInt16LE(this.updatePosition(Values.Int16))
	}
	/**
	 * Reads a UTF-8 string from the byte stream. The string is assumed to be prefixed with an unsigned short indicating the length in bytes.
	 * @returns {string}
	 */
	readUTF () {
		let length = this.readShort()
		return this.buffer.toString("utf8", this.offset, this.offset + length)
	}
	/**
	 * Reads a sequence of UTF-8 bytes specified by the length parameter from the byte stream and returns a string.
	 * @param {number} length
	 * @returns {string}
	 */
	readUTFBytes (length) {
		let offset = this.updatePosition(length)
		return this.buffer.toString("utf8", offset, offset + length)
	}
	/**
	 * Reads a single UTF-8 character from the byte stream.
	 * @returns {string}
	 */
	readChar () {
		return String.fromCharCode(this.buffer[this.offset++])
	}
	/**
	 * Reads an array of signed bytes from the byte stream.
	 * @param {number} length
	 * @returns {int8array}
	 */
	readByteArray (length) {
		return new Int8Array(this.range(length).map(() => this.readByte()))
	}
	/**
	 * Reads an array of signed 16-bit integers from the byte stream.
	 * @param {number} length
	 * @returns {int16array}
	 */
	readShortArray (length) {
		return new Int16Array(this.range(length).map(() => this.readShort()))
	}
	/**
	 * Reads an array of signed 32-bit integers from the byte stream.
	 * @param {number} length
	 * @returns {int32array}
	 */
	readIntArray (length) {
		return new Int32Array(this.range(length).map(() => this.readInt()))
	}
	/**
	 * Reads a signed 64-bit integer from the byte stream.
	 * @returns {number}
	 */
	readLong () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readInt32BE(this.updatePosition(4)) | this.buffer.readInt32BE(this.updatePosition(4))
		: this.buffer.readInt32LE(this.updatePosition(4)) | this.buffer.readInt32LE(this.updatePosition(4))
	}
	/**
	 * Reads an unsigned 64-bit integer from the byte stream.
	 * @returns {number}
	 */
	readUnsignedLong () {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.readUInt32BE(this.updatePosition(4)) | this.buffer.readUInt32BE(this.updatePosition(4))
		: this.buffer.readUInt32LE(this.updatePosition(4)) | this.buffer.readUInt32LE(this.updatePosition(4))
	}
	/**
	 * Writes a Boolean value. A single byte is written according to the value parameter, either 1 if true or 0 if false.
	 * @param {boolean} value
	 */
	writeBoolean (value) {
		return this.buffer.writeInt8(Number(value), this.updatePosition(Values.Int8))
	}
	/**
	 * Writes a byte to the byte stream.
	 * @param {number} value
	 */
	writeByte (value) {
		return this.buffer.writeInt8(value, this.updatePosition(Values.Int8))
	}
	/**
	 * Writes a sequence of length bytes from the specified byte array, bytes, starting offset(zero-based index) bytes into the byte stream.
	 * If the length parameter is omitted, the default length of 0 is used; the method writes the entire buffer starting at offset.
	 * If the offset parameter is also omitted, the entire buffer is written.
	 * If offset or length is out of range, they are clamped to the beginning and end of the bytes array.
	 * @param {bytearray} bytes
	 * @param {number} offset
	 * @param {number} length
	 */
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
	/**
	 * Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
	 * @param {number} value
	 */
	writeDouble (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeDoubleBE(value, this.updatePosition(Values.Double))
		: this.buffer.writeDoubleLE(value, this.updatePosition(Values.Double))
	}
	/**
	 * Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
	 * @param {number} value
	 */
	writeFloat (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeFloatBE(value, this.updatePosition(Values.Float))
		: this.buffer.writeFloatLE(value, this.updatePosition(Values.Float))
	}
	/**
	 * Writes a 32-bit signed integer to the byte stream.
	 * @param {number} value
	 */
	writeInt (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeInt32BE(value, this.updatePosition(Values.Int32))
		: this.buffer.writeInt32LE(value, this.updatePosition(Values.Int32))
	}
	/**
	 * Writes a multibyte string to the byte stream using the specified character set.
	 * @param {string} str
	 * @param {string} charset
	 */
	writeMultiByte (str, charset) { /* ascii, utf8, utf16le, ucs2, base64, latin1, binary, hex */
		str = this.axCoerceString(str)
		charset = this.axCoerceString(charset)
		let length = Buffer.byteLength(str)
		return this.buffer.write(str, this.updatePosition(length), length, charset || "utf8")
	}
	/**
	 * Writes an object into the byte array in AMF serialized format.
	 * @param {object} object
	 */
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
	/**
	 * Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
	 * @param {number} value
	 */
	writeShort (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeInt16BE(value, this.updatePosition(Values.Int16))
		: this.buffer.writeInt16LE(value, this.updatePosition(Values.Int16))
	}
	/**
	 * Writes an unsigned byte to the byte stream.
	 * @param {number} value
	 */
	writeUnsignedByte (value) {
		return this.buffer.writeUInt8(value, this.updatePosition(Values.Int8))
	}
	/**
	 * Writes a 32-bit unsigned integer to the byte stream.
	 * @param {number} value
	 */
	writeUnsignedInt (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeUInt32BE(value, this.updatePosition(Values.Int32))
		: this.buffer.writeUInt32LE(value, this.updatePosition(Values.Int32))
	}
	/**
	 * Writes an unsigned 16-bit integer to the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
	 * @param {number} value
	 */
	writeUnsignedShort (value) {
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeUInt16BE(value, this.updatePosition(Values.Int16))
		: this.buffer.writeUInt16LE(value, this.updatePosition(Values.Int16))
	}
	/**
	 * Writes a UTF-8 string to the byte stream.
	 * The length of the UTF-8 string in bytes is written first, as a 16-bit integer, followed by the bytes representing the characters of the string.
	 * @param {string} str
	 */
	writeUTF (str) {
		str = this.axCoerceString(str)
		let length = Buffer.byteLength(str)
		this.writeShort(length)
		return this.buffer.write(str, this.offset, this.offset += length, "utf8")
	}
	/**
	 * Writes a UTF-8 string to the byte stream. Similar to the writeUTF() method, but writeUTFBytes() does not prefix the string with a 16-bit length word.
	 * @param {string} str
	 */
	writeUTFBytes (str) {
		str = this.axCoerceString(str)
		let length = Buffer.byteLength(str)
		return this.buffer.write(str, this.offset, this.offset += length, "utf8")
	}
	/**
	 * Writes a single UTF-8 character to the byte stream.
	 * @param {string} value
	 */
	writeChar (value) {
		return this.writeUnsignedByte(value.charCodeAt(0))
	}
	/**
	 * Writes an array of signed bytes to the byte stream.
	 * @param {array} values
	 */
	writeByteArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes")
		}
		values.forEach(value => {
			this.writeByte(value)
		})
	}
	/**
	 * Writes an array of 16-bit integers to the byte stream.
	 * @param {array} values
	 */
	writeShortArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes")
		}
		values.forEach(value => {
			this.writeShort(value)
		})
	}
	/**
	 * Writes an array of 32-bit integers to the byte stream.
	 * @param {array} values
	 */
	writeIntArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes")
		}
		values.forEach(value => {
			this.writeInt(value)
		})
	}
	/**
	 * Writes a 64-bit integer to the byte stream.
	 * @param {number} value
	 */
	writeLong (value) {
		if (value > 0x7FFFFFFFFFFFFFFF || value < -0x8000000000000000) {
			throw new RangeError("Value is out of bounds")
		}
		if (this.offset + 8 > this.length) {
			throw new RangeError("Index is out of range")
		}
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeInt32BE(high, this.updatePosition(4)) | this.buffer.writeInt32BE(low, this.updatePosition(4))
		: this.buffer.writeInt32LE(value % 0x100000000, this.updatePosition(4)) | this.buffer.writeInt32LE(Math.floor(value / 0x100000000), this.updatePosition(4))
	}
	/**
	 * Writes an unsigned 64-bit integer to the byte stream.
	 * @param {number} value
	 */
	writeUnsignedLong (value) {
		if (value > 0xFFFFFFFFFFFFFFFF || value < 0) {
			throw new RangeError("Value is out of bounds")
		}
		if (this.offset + 8 > this.length) {
			throw new RangeError("Index is out of range")
		}
		let high = Math.floor(value / 0x100000000)
		let low = value - high * 0x100000000
		return this.endian === Values.BIG_ENDIAN
		? this.buffer.writeUInt32BE(high, this.updatePosition(4)) | this.buffer.writeUInt32BE(low, this.updatePosition(4))
		: this.buffer.writeUInt32LE(value % 0x100000000, this.updatePosition(4)) | this.buffer.writeUInt32LE(Math.floor(value / 0x100000000), this.updatePosition(4))
	}
}

module.exports = ByteArray