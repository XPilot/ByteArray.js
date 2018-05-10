"use strict";

const xmlserializer = require("xmlserializer");
const parser = require("parse5");

const Values = {
	Int8: 1,
	Double: 8,
	Float: 4,
	Int32: 4,
	Int16: 2,
	MAX_BUFFER_SIZE: 4096,
	BIG_ENDIAN: true,
	LITTLE_ENDIAN: false
};

class ByteArray {
	constructor (buff) {
		this.offset = 0;
		this.byteLength = this.offset || 0;
		this.endian = Values.BIG_ENDIAN;
		this.writeObjectCache = [];
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
		let a = this.offset;
		this.offset += n;
		return a
	}

	readBoolean () {
		return Boolean(this.buffer.readInt8(this.updatePosition(Values.Int8)) & 0xFF);
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
		let endOffset = offset + length;
		for (let i = offset; i < endOffset; i++) {
			bytes[i] = this.readByte();
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
		let offset = this.updatePosition(length);
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
		let length = this.readByte();
		return this.buffer.toString("utf8", this.offset, this.offset + length)
	}

	readUTFBytes (length) {
		let offset = this.updatePosition(length);
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
		let endOffset;
		if (length === undefined || length === 0) {
			endOffset = bytes.length
		} else {
			endOffset = offset + length;
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
		let length = Buffer.byteLength(str);
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
		let length = Buffer.byteLength(str);
		this.writeByte(length);
		return this.buffer.write(str, this.offset, this.offset += length, "utf8")
	}

	writeUTFBytes (str) {
		let length = Buffer.byteLength(str);
		return this.buffer.write(str, this.offset, this.offset += length, "utf8")
	}

	writeChar (value) {
		return this.writeUnsignedByte(value.charCodeAt(0))
	}

	writeByteArray (values) {
		if (!Array.isArray(values)) {
			 throw new TypeError("Expected an array of bytes");
		}
		values.forEach(value => {
			this.writeByte(value)
		})
	}

	writeShortArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes");
		}
		values.forEach(value => {
			this.writeShort(value)
		})
	}

	writeIntArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes");
		}
		values.forEach(value => {
			this.writeInt(value)
		})
	}

	writeCharArray (values) {
		if (!Array.isArray(values)) {
			throw new TypeError("Expected an array of bytes");
		}
		values.forEach(value => {
			this.writeChar(value)
		})
	}

	/**************
	* AMF objects *
	**************/

	/*******
	* AMF3 *
	*******/
	encodeUtf8String (string) {
		let utf8Data = []
		for (let i = 0; i < string.length; i++) {
			let data = this.encodeUtf8Char(string.charCodeAt(i))
			utf8Data.push(data)
		}
		return utf8Data
	}
	encodeUtf8StringLen (utf8Data) {
		let len = utf8Data.length, data = []
		if (len <= 0xFFFFFFF) {
			len = len << 1
			len = len | 1
			data = this.encode29Int(len)
		} else {
			throw new RangeError("UTF8 encoded string too long to serialize to AMF: " + len)
		}
		return data
	}
	encodeUtf8Char (c) {
		let data = [], val, b, marker
		if (c > 0x10FFFF) {
			throw new RangeError("UTF8 char out of bounds")
		}
		if (c <= 0x7F) {
			data.push(c)
		} else {
			if (c <= 0x7ff) {
				b = 2
			} else if (c <= 0xffff) {
				b = 3
			} else {
				b = 4
			}
			marker = 0x80
			for (let i = 1; i < b; i++) {
				val = (c & 0x3F) | 0x80
				data.unshift(val)
				c = c >> 6
				marker = (marker >> 1) | 0x80
			}
			val = c | marker
			data.unshift(val)
		}
		return data
	}
	encode29Int (item) {
		let data = [], num = item, nibble
		if (num == 0) {
			return [0]
		}
		if (num > 0x001fffff) {
			nibble = num & 0xff
			data.unshift(nibble)
			num = num >> 8
		}
		while (num > 0) {
			nibble = num & 0x7f
			data.unshift(nibble)
			num = num >> 7
		}
		for (let i = 0; i < data.length - 1; i++) {
			data[i] = data[i] | 0x80
		}
		return data
	}
	isTypedArray (item) {
		return item instanceof Int8Array || item instanceof Uint8Array	|| item instanceof Uint8ClampedArray || item instanceof Int16Array || item instanceof Uint16Array || item instanceof Int32Array || item instanceof Uint32Array || item instanceof Float32Array || item instanceof Float64Array
	}
	writeObjectAMF3 (item) { // Not fully identical to AMF3's writeObject, but close to it and it works
		if (this.isTypedArray(item)) {
			let typedBuffer = Buffer.from(item.buffer)
			if (item.byteLength !== item.buffer.byteLength) {
				typedBuffer = typedBuffer.slice(item.byteOffset, item.byteOffset + item.byteLength)
			}
			this.writeObjectAMF3(typedBuffer)
		} else if (item instanceof ArrayBuffer) {
			let convertBuffer = new Buffer(item.byteLength)
			let convertViewer = new Uint8Array(item)
			for (let i = 0; i < convertBuffer.length; i++) {
				convertBuffer[i] = convertViewer[i]
			}
			this.writeObjectAMF3(convertBuffer)
		} else if (item instanceof Buffer) {
			this.writeByte(12)
			this.writeBytes(this.encode29Int(item.length << 1 | 0x1))
			item.copy(this.buffer, this.offset)
		} else if (item instanceof Date) {
			this.writeByte(0x08)
			this.writeBytes(this.encode29Int(0x1))
			this.writeDouble(item.getTime())
		} else if (!isNaN(item) && item.toString().indexOf(".") != -1) { // Has decimal point
			this.writeObjectAMF3(Number(item)) // Change the instanceof to Number to fit writeNumber
		} else if (typeof item === "undefined") {
			this.writeByte(0x00)
		} else if (item === null) {
			this.writeByte(0x01)
		} else if (typeof item === "boolean") {
			if (item) {
				this.writeByte(0x03)
			} else {
				this.writeByte(0x02)
			}
		} else if (typeof item === "string") {
			if (item == "") {
				this.writeByteArray([0x06, 0x01])
			} else {
				let utf8Data = this.encodeUtf8String(item)
				let lenData = this.encodeUtf8StringLen(utf8Data)
				this.writeByte(0x06)
				this.writeByteArray(lenData)
				this.writeByteArray(utf8Data)
			}
		} else if (typeof item === "number" || item instanceof Number) {
			let data
			if (item instanceof Number) {
				item = item.valueOf()
			}
			if (item % 1 === 0 && item >= -0xfffffff && item <= 0x1fffffff) {
				item = item & 0x1fffffff
				data = this.encode29Int(item)
				data.unshift(0x04)
				this.writeByteArray(data)
			} else {
				data = this.writeDouble(item)
				data.unshift(0x05)
				this.writeByteArray(data)
			}
		} else if (typeof item === "object") {
			if (Array.isArray(item)) {
				if (item.length > 0xFFFFFFF) {
					throw new RangeError("Array size too long to encode: " + item.length)
				}
				this.writeByte(0x09)
				item.length = item.length << 1
				item.length = item.length | 0x1
				this.writeByteArray(this.encode29Int(item.length))
				this.writeByte(0x01)
				item.forEach(x => {
					this.writeObjectAMF3(x)
				})
			} else if (item.toString().indexOf("[Vector") == 0) {
				this.writeByte(item.type) // int = 13, uint = 14, double = 15, object = 16
				item.length = item.length << 1
				item.length = item.length | 0x1
				this.writeByteArray(this.encode29Int(item.length))
				this.writeBoolean(true) // Fixed
				if (item.type == 0x10) {
					let className = ""
					if (item.length > 0) {
						className = item[0].name
					}
					let utf8Data0 = this.encodeUtf8String(className)
					let lenData0 = this.encodeUtf8StringLen(utf8Data0)
					this.writeByteArray(lenData0)
					this.writeByteArray(utf8Data0)
					for (let i = 0; i < item.length; i++) {
						this.writeObjectAMF3(item[i])
					}
				} else if (item.type == 0xD) {
					for (let i = 0; i < item.length; i++) {
						this.writeInt(item[i])
					}
				} else if (item.type == 0xE) {
					for (let i = 0; i < item.length; i++) {
						this.writeUnsignedInt(item[i])
					}
				} else if (item.type == 0xF) {
					for (let i = 0; i < item.length; i++) {
						this.writeDouble(item[i])
					}
				}
			} else if (typeof item.doctype !== "undefined" && typeof item.xml === "string") {
				let amfType = 0x0B // writeXml = 0x0B, 0x07 = xmlDocument
				if (amfType !== 0x07 && amfType !== 0x0B) {
					throw new TypeError("XML with unknown type: " + amfType)
				}
				let xmlStr = parser.parse(item)
				let serializedXmlStr = xmlserializer.serializeToString(xmlStr)
				if (serializedXmlStr == "") {
					this.writeByteArray([amfType, 0x01])
				} else {
					let utf8Data2 = this.encodeUtf8String(serializedXmlStr)
					let lenData2 = this.encodeUtf8StringLen(utf8Data2)
					this.writeByte(amfType)
					this.writeByteArray(lenData2)
					this.writeByteArray(utf8Data2)
				}
			} else {
				let name
				this.writeByteArray([0x0A, 0x0b, 0x01])
				for (name in item) {
					let newName = new String(name).valueOf()
					if (newName == "") {
						throw new Error("Can't encode non-string field name: " + name)
					}
					let nameData = this.encodeUtf8String(name)
					this.writeByteArray(this.encodeUtf8StringLen(name))
					this.writeByteArray(nameData)
					this.writeObjectAMF3(item[name])
				}
				this.writeByte(0x01)
			}
		} else {
			this.writeByte(0xA)
			this.writeByteArray(this.encode29Int(0xB))
			this.writeByteArray([0x06, 0x01])
			for (let key in item) {
				if (key) {
					this.writeByteArray(this.encodeUtf8StringLen(key))
				} else {
					this.writeByte(0x01)
				}
				this.writeObjectAMF3(item[key])
			}
			this.writeByte(0x01)
		}
	}

	/*******
	* AMF0 *
	*******/
	hasItem (array, item) {
		let i = array.length
		while (i--) {
			if (this.isSame(array[i], item)) {
				return i
			}
		}
		return -1
	}
	isSame (item1, item2) {
		if (typeof item1 === "object" && typeof item2 === "object") {
			if (Object(item1).constructor === Object(item2).constructor) {
				for (let i in item1) {
					if (typeof item1[i] === "object") {
						if (!this.isSame(item1[i], item2[i])) {
							return false
						}
					} else if (item1[i] !== item2[i]) {
						return false
					}
				}
				return true
			} else {
				return false
			}
		}
		return (item1 === item2)
	}
	setObjectReference (o) {
		let refNum
		if (this.writeObjectCache !== null && (refNum = this.hasItem(this.writeObjectCache, o)) !== -1) {
			this.writeByte(7)
			this.writeUnsignedShort(refNum)
			return false
		} else {
			if (this.writeObjectCache === null) {
				this.writeObjectCache = []
			}
			if (this.writeObjectCache.length < 1024) {
				this.writeObjectCache.push(o)
			}
			return true
		}
	}
	isStrict (array) {
		let l = array.length
		let count = 0
		for (let key in array) {
			count++
		}
		return (count === l)
	}
	writeObjectAMF0 (value) {
		if (this.setObjectReference(value)) {
			this.writeByteArray([3,0])
			for (let key in value) {
				this.writeUTF(key)
				this.writeData(value[key])
			}
			this.writeUTF("")
			this.writeByte(9)
		}
	}
	writeData (value) { // AMF0
		if (typeof value === "number" || value instanceof Number) {
			this.writeByte(0)
			this.writeDouble(value)
		} else if (typeof value === "boolean") {
			this.writeByte(1)
			this.writeBoolean(value)
		} else if (typeof value === "string") {
			if (value === "__unsupported") {
				this.writeByte(13)
			} else {
				if (value.length < 65536) {
					this.writeByteArray([2,0])
					this.writeUTF(value)
					this.writeByte(0)
				} else {
					this.writeByteArray([0,12])
					this.writeUTFBytes(value)
					this.writeByte(0)
				}
			}
		} else if (value === null) {
			this.writeByte(5)
		} else if (value === undefined) {
			this.writeByte(6)
		} else if (value instanceof Date) {
			this.writeByte(11)
			this.writeDouble(value.getTime())
			this.writeShort(0)
		} else if (Array.isArray(value)) {
			if (this.isStrict(value)) {
				if (this.setObjectReference(value)) {
					this.writeByte(10)
					this.writeInt(value.length)
					for (let i = 0; i < value.length; i++) {
						this.writeData(value[i])
					}
				}
			} else {
				if (this.setObjectReference(value)) {
					this.writeByte(8)
					this.writeUnsignedInt(value.length)
					for (let key in value) {
						this.writeUTF(key)
						this.writeData(value[key])
					}
					this.writeByteArray([0,0,9])
				}
			}
		} else if (value.startsWith("<") && value.endsWith("/>") && typeof value === "string") {
			if (this.setObjectReference(value)) {
				this.writeByte(15)
				let strXML = value.toString()
				strXML = strXML.replace(/^\s+|\s+$/g, "")
				this.writeUnsignedInt(strXML.length)
				this.writeUTFBytes(strXML)
			}
		} else if (typeof value === "object") {
			if (this.setObjectReference(value)) {
				this.writeByte(16)
				this.writeUTF(Object.prototype.toString.call(value)) // [object Object]
				this.writeObjectAMF0(value)
			}
		} else {
			throw new TypeError("Unknown data type")
		}
	}
}

module.exports = ByteArray;