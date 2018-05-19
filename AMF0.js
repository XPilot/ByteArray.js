"use strict"

class AMF0 {
	constructor() {
		this.writeObjectCache = []
		this.isDebug = true
	}

	writeValue(value) {
		let className = value.constructor.name.toLowerCase()
		if (this.isDebug) {
			//console.log("Type to be serialized: <" + typeof value + "> with class: <" + className + ">")
		}
		/*
		Special type check.
		*/
		if (className === "stdclass") {
			return this.writeObject(value)
		}
		if (value instanceof Date) {
			return this.writeDate(value)
		}
		if (typeof value === "string" && value.startsWith("<") && value.endsWith(">")) {
			if (className === "libxmljs" || className === "xml2js") { // These are 2 examples of XML parsing modules for Node.js.
				console.log("Serializing XML with an XML parser")
				return this.writeXMLDoc(value)
			} else {
				console.log("Trying to serialize XML without parsing the XML, continue anyway")
				return this.writeXMLDoc(value)
			}
		}
		switch (typeof value) {
			case "number":
			return this.writeNumber(value)
			break
			case "boolean":
			return this.writeBoolean(value)
			break
			case "string":
			if (value.length < 65535) {
				return this.writeString(value)
			} else {
				return this.writeLongString(value)
			}
			break
			case "object":
			if (Array.isArray(value)) {
				if (this.isStrict(value)) {
					return this.writeStrictArray(value)
				} else {
					return this.writeECMAArray(value)
				}
			} else {
				return this.writeObject(value)
			}
			break
			if (Array.isArray(value)) {
				if (this.isStrict(value)) {
					return this.writeStrictArray(value)
				} else {
					return this.writeECMAArray(value)
				}
			}
			break
			case "null":
			return this.writeNull()
			break
			case "undefined":
			return this.writeUndefined()
			break
		}
	}
	readValue(buffer) {
		if (this.isDebug) {
			console.log("Buffer to deserialize:", buffer)
		}
		let value = buffer.readUInt8(0)
		switch (value) {
			case 0x00:
			return this.readNumber(buffer)
			break
			case 0x01:
			return this.readBoolean(buffer)
			break
			case 0x02:
			return this.readString(buffer)
			break
			case 0x03:
			return this.readObject(buffer)
			break
			case 0x05:
			return this.readNull()
			break
			case 0x06:
			return this.readUndefined()
			break
			case 0x07:
			return this.readReference(buffer)
			break
			case 0x08:
			return this.readECMAArray(buffer)
			break
			case 0x0a:
			return this.readStrictArray(buffer)
			break
			case 0x0b:
			return this.readDate(buffer)
			break
			case 0x0c:
			return this.readLongString(buffer)
			break
			case 0x0f:
			return this.readXMLDoc(buffer)
			break
			case 0x10:
			return this.readTypedObject(buffer)
			break
			default:
			throw new Error("Unknown type")
		}
	}
	toString(buffer) {
		return buffer.toString("utf8", 0, Buffer.byteLength(buffer))
	}
	isStrict(value) {
		let l = value.length, c = 0
		for (let key in value) c++
			return (c == l)
	}
	hasItem(array, item) {
		let i = array.length
		while (i--) {
			if (this.isSame(array[i], item)) {
				return i
			}
		}
		return -1
	}
	isSame(item1, item2) {
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
	setObjectReference(o) {
		let refNum
		if (this.writeObjectCache !== null && (refNum = this.hasItem(this.writeObjectCache, o)) !== -1) {
			let buffer = Buffer.alloc(3)
			buffer.writeUInt8(7, 0)
			buffer.writeUInt16BE(refNum, 1)
			return false
		} else {
			if (this.writeObjectCache === null) {
				this.writeObjectCache = []
			}
			if (this.writeObjectCache.length < 64) {
				this.writeObjectCache.push(o)
			}
			return true
		}
	}
	/*
	2.2 Number Type
	An AMF 0 Number type is used to encode an ActionScript Number. The data following a
	Number type marker is always an 8 byte IEEE-754 double precision floating point value
	in network byte order (sign bit in low memory).
	*/
	writeNumber(value) {
		let buffer = Buffer.alloc(9)
		buffer.writeUInt8(0x00, 0)
		buffer.writeDoubleBE(value, 1)
		return buffer
	}
	readNumber(buffer) {
		return {
			len: 9,
			value: buffer.readDoubleBE(1)
		}
	}
	/*
	2.3 Boolean Type
	An AMF 0 Boolean type is used to encode a primitive ActionScript 1.0 or 2.0 Boolean or
	an ActionScript 3.0 Boolean. The Object (non-primitive) version of ActionScript 1.0 or
	2.0 Booleans are not serializable. A Boolean type marker is followed by an unsigned
	byte; a zero byte value denotes false while a non-zero byte value (typically 1) denotes
	true.
	*/
	writeBoolean(value) {
		let buffer = Buffer.alloc(2)
		buffer.writeUInt8(0x01, 0)
		buffer.writeUInt8((value ? 1 : 0), 1)
		return buffer
	}
	readBoolean(buffer) {
		return {
			len: 2,
			value: (buffer.readUInt8(1) != 0)
		}
	}
	/*
	2.4 String Type
	All strings in AMF are encoded using UTF-8; however, the byte-length header format
	may vary. The AMF 0 String type uses the standard byte-length header (i.e. U16). For
	long Strings that require more than 65535 bytes to encode in UTF-8, the AMF 0 Long
	String type should be used.
	*/
	writeString(value) {
		if (value.length < 65535) {
			let buffer = Buffer.alloc(1)
			buffer.writeUInt8(0x02)
			let buffer2 = Buffer.alloc(2)
			buffer2.writeUInt16BE(Buffer.byteLength(value), 0)
			return Buffer.concat([buffer, buffer2, Buffer.from(value, "utf8")])
		} else {
			return this.writeLongString(value)
		}
	}
	readString(buffer) {
		let length = buffer.readUInt16BE(1)
		return {
			len: 3 + length,
			value: buffer.toString("utf8", 3, 3 + length)
		}
	}
	writeStringWithoutType(value) {
		if (value.length < 65535) {
			let buffer = Buffer.alloc(2)
			buffer.writeUInt16BE(Buffer.byteLength(value), 0)
			return Buffer.concat([buffer, Buffer.from(value, "utf8")])
		} else {
			return this.writeLongStringWithoutType(value)
		}
	}
	readStringWithoutType(buffer) {
		let length = buffer.readUInt16BE(0)
		return {
			len: 2 + length,
			value: buffer.toString("utf8", 2, 2 + length).toString()
		}
	}
	/*
	2.5 Object Type
	The AMF 0 Object type is used to encoded anonymous ActionScript objects. Any typed
	object that does not have a registered class should be treated as an anonymous
	ActionScript object. If the same object instance appears in an object graph it should be
	sent by reference using an AMF 0.
	Use the reference type to reduce redundant information from being serialized and infinite
	loops from cyclical references.
	*/
	writeObject(value) {
		if (this.setObjectReference(value)) {
			let buffer = Buffer.alloc(1)
			buffer.writeUInt8(0x03, 0)
			for (let key in value) {
				if (typeof value[key] !== "function") {
					buffer = Buffer.concat([buffer, this.writeStringWithoutType(key), this.writeValue(value[key])])
				}
			}
			let endObject = Buffer.alloc(3)
			endObject.writeUInt16BE(0x00, 0)
			endObject.writeUInt8(0x09, 2)
			return Buffer.concat([buffer, endObject])
		}
	}
	readObject(buffer) {
		let rules = { 0x00: this.readNumber, 0x01: this.readBoolean, 0x02: this.readString, 0x03: this.readObject, 0x05: this.readNull, 0x06: this.readUndefined, 0x07: this.readReference, 0x08: this.readECMAArray, 0x0a: this.readStrictArray, 0x0b: this.readDate, 0x0c: this.readLongString, 0x0f: this.readXMLDoc, 0x10: this.readTypedObject }
		let object = {}
		let iBuf = buffer.slice(1)
		let length = 1
		while (iBuf.readUInt8(0) != 0x09) {
			let prop = this.readStringWithoutType(iBuf)
			length += prop.len
			if (iBuf.slice(prop.len).readUInt8(0) == 0x09) {
				length++
				break
			}
			if (prop.value == "") {
				break
			}
			let buffer2 = iBuf.slice(prop.len)
			if (!rules[buffer2.readUInt8(0)]) {
				throw new Error("Unknown field")
			}
			let val = rules[buffer2.readUInt8(0)](buffer2)
			object[prop.value] = val.value
			length += val.len
			iBuf = iBuf.slice(prop.len + val.len)
		}
		return {
			len: length,
			value: object
		}
	}
	/*
	2.7 Null Type
	The null type is represented by the null type marker. No further information is encoded
	for this value.
		*/
	writeNull() {
		let buffer = Buffer.alloc(1)
		buffer.writeUInt8(0x05, 0)
		return buffer
	}
	readNull() {
		return {
			len: 1,
			value: null
		}
	}
    /*
    2.8 Undefined Type
    The undefined type is represented by the undefined type marker. No further information
    is encoded for this value.
    */
    writeUndefined() {
    	let buffer = Buffer.alloc(1)
    	buffer.writeUInt8(0x06, 0)
    	return buffer
    }
    readUndefined() {
    	return {
    		len: 1,
    		value: undefined
    	}
    }
    /*
    2.9 Reference Type
    AMF0 defines a complex object as an anonymous object, a typed object, an array or an
    ecma-array. If the exact same instance of a complex object appears more than once in an
    object graph then it must be sent by reference. The reference type uses an unsigned 16-
    bit integer to point to an index in a table of previously serialized objects. Indices start at
    0.
    */
    writeReference(value) {
    	let buffer = Buffer.alloc(3)
    	buffer.writeUInt8(0x07, 0)
    	buffer.writeUInt16BE(value, 1)
    	return buffer
    }
    readReference(buffer) {
    	return {
    		len: 3,
    		value: "ref" + buffer.readUInt16BE(1)
    	}
    }
	/*
	2.10 ECMA Array Type
	An ECMA Array or 'associative' Array is used when an ActionScript Array contains nonordinal
    indices. This type is considered a complex type and thus reoccurring instances
    can be sent by reference. All indices, ordinal or otherwise, are treated as string 'keys'
    instead of integers. For the purposes of serialization this type is very similar to an
	anonymous Object.
	*/
	writeECMAArray(value) {
		if (this.setObjectReference(value)) {
			let l = value.length
			let buffer = Buffer.alloc(5)
			buffer.writeUInt8(0x08, 0)
			buffer.writeUInt32BE(l, 1)
			for (let key in value) {
				buffer = Buffer.concat([buffer, this.writeStringWithoutType(key), this.writeValue(value[key])])
			}
			let buffer2 = Buffer.alloc(3)
			buffer2.writeUInt8(0x00, 0)
			buffer2.writeUInt8(0x00, 1)
			buffer2.writeUInt8(0x09, 2)
			return Buffer.concat([buffer, buffer2])
		}
	}
	readECMAArray(buffer) {
		let obj = this.readObject(buffer.slice(4))
		return {
			len: 5 + obj.len,
			value: obj.value
		}
	}
	/*
	2.12 Strict Array Type
	A strict Array contains only ordinal indices; however, in AMF 0 the indices can be dense
	or sparse. Undefined entries in the sparse regions between indices are serialized as
	undefined.
	A 32-bit array-count implies a theoretical maximum of 4,294,967,295 array entries.
	*/
	writeStrictArray(value) {
		if (this.setObjectReference(value)) {
			let buffer = Buffer.alloc(5)
			buffer.writeUInt8(0x0a, 0)
			buffer.writeUInt32BE(value.length, 1)
			value.forEach(values => {
				buffer = Buffer.concat([buffer, this.writeValue(values)])
			})
			return buffer
		}
	}
	readStrictArray(buffer) {
		let rules = { 0x00: this.readNumber, 0x01: this.readBoolean, 0x02: this.readString, 0x03: this.readObject, 0x05: this.readNull, 0x06: this.readUndefined, 0x07: this.readReference, 0x08: this.readECMAArray, 0x0a: this.readStrictArray, 0x0b: this.readDate, 0x0c: this.readLongString, 0x0f: this.readXMLDoc, 0x10: this.readTypedObject }
		let array = []
		let length = 5
		let ret
		for (let count = buffer.readUInt32BE(1); count; count--) {
			let buffer2 = buffer.slice(length)
			if (!rules[buffer2.readUInt8(0)]) {
				throw new Error("Unknown field")
			}
			ret = rules[buffer2.readUInt8(0)](buffer2)
			array.push(ret.value)
			length += ret.len
		}
		return {
			len: len,
			value: Object.defineProperty(array, "sarray", {
				value: true
			})
		}
	}
	/*
	2.13 Date Type
	An ActionScript Date is serialized as the number of milliseconds elapsed since the epoch
	of midnight on 1st Jan 1970 in the UTC time zone. While the design of this type reserves
	room for time zone offset information, it should not be filled in, nor used, as it is
	unconventional to change time zones when serializing dates on a network. It is suggested
	that the time zone be queried independently as needed.
	*/
	writeDate(value) {
		let buffer = Buffer.alloc(11)
		buffer.writeUInt8(0x0b, 0)
		buffer.writeInt16BE(0, 1)
		buffer.writeDoubleBE(value.getTime(), 3)
		return buffer
	}
	readDate(buffer) {
		return {
			s16: buffer.readInt16BE(1),
			len: 11,
			value: buffer.readDoubleBE(3)
		}
	}
	/*
	2.14 Long String Type
	A long string is used in AMF 0 to encode strings that would occupy more than 65535
	bytes when UTF-8 encoded. The byte-length header of the UTF-8 encoded string is a 32-
	bit integer instead of the regular 16-bit integer.
	*/
	writeLongString(value) {
		if (value.length > 65535) {
			let buffer = Buffer.alloc(1)
			buffer.writeUInt8(0x0C)
			let buffer2 = Buffer.alloc(4)
			buffer2.writeUInt32BE(Buffer.byteLength(value), 0)
			return Buffer.concat([buffer, buffer2, Buffer.from(value, "utf8")])
		} else {
			return this.writeString(value)
		}
	}
	readLongString(buffer) {
		let length = buffer.readUInt32BE(1)
		return {
			len: 5 + length,
			value: buffer.toString("utf8", 5, 5 + length)
		}
	}
	writeLongStringWithoutType(value) {
		if (value.length > 65535) {
			let buffer = Buffer.alloc(4)
			buffer.writeUInt32BE(Buffer.byteLength(value), 0)
			return Buffer.concat([buffer, Buffer.from(value, "utf8")])
		} else {
			return this.writeStringWithoutType(value)
		}
	}
	readLongStringWithoutType(buffer) {
		let length = buffer.readUInt32BE(0)
		return {
			len: 4 + length,
			value: buffer.toString("utf8", 4, 4 + length)
		}
	}
	/*
	2.17 XML Document Type
	An XMLDocument in ActionScript 1.0 and 2.0 and flash.xml.XMLDocument in
	ActionScript 3.0 provides a DOM representation of an XML document. However, on
	serialization a string representation of the document is used. The XML document type is
	always encoded as a long UTF-8 string.
	*/
	writeXMLDoc(value) {
		if (this.setObjectReference(value)) {
			let buffer = Buffer.alloc(3)
			buffer.writeUInt8(0x0f, 0)
			buffer.writeUInt16BE(value.length, 1)
			return Buffer.concat([buffer, Buffer.from(value, "utf8")])
		}
	}
	readXMLDoc(buffer) {
		let length = buffer.readUInt16BE(1)
		return {
			len: 3 + length,
			value: buffer.toString("utf8", 3, 3 + length)
		}
	}
	/*
	2.18 Typed Object Type
	If a strongly typed object has an alias registered for its class then the type name will also
	be serialized. Typed objects are considered complex types and reoccurring instances can
	be sent by reference.
	*/
	writeTypedObject(value) {
		if (this.setObjectReference(value)) {
			let buffer = Buffer.alloc(1)
			buffer.writeUInt8(0x10, 0)
			for (let key in value) {
				if (!key.startsWith("_")) {
					buffer = Buffer.concat([buffer, this.writeStringWithoutType(key.constructor.name), this.writeValue(value[key])])
				}
			}
			let endTypedObject = Buffer.alloc(3)
			endTypedObject.writeUInt16BE(0x00, 0)
			endTypedObject.writeUInt8(0x09, 2)
			return Buffer.concat([buffer, endTypedObject])
		}
	}
	readTypedObject(buffer) {
		let className = this.readString(buffer)
		let object = this.readObject(buffer.slice(className.value.len - 1))
		object.value.__className__ = className.value
		return {
			len: className.len + object.len - 1,
			value: object.value
		}
	}
}

module.exports = AMF0