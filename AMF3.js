const ByteArray = require("./ByteArray")

class AMF3 {
	constructor (buff) {
		this.byteArr = buff
		this.buffer = this.byteArr.buffer

		this.objects = []
		this.objectCount = 0

		this.strings = []
		this.stringCount = 0

		this.traits = []

	}

	reset () {
		this.byteArr.position = 0
	}

	objectByReference (v) {
		let ref = 0
		let found = false
		for (; ref < this.objects.length; ref++) {
			if (this.objects[ref] === v) {
				found = true
				break
			}
		}
		if (found) {
			this.writeUInt29(ref << 1)
			console.log("AMF3::objectByReference - Info: {Reference #" + ref + "}")
		} else {
			this.objects.push(v)
			this.objectCount++
		}
		return found ? ref : null
	}
	stringByReference (v) {
		let ref = this.strings[v]
		if (ref) {
			this.writeUInt29(ref << 1)
			console.log("AMF3::stringByReference - Info: {Reference #" + ref + "}")
		} else {
			this.strings[v] = this.stringCount++
		}
		return ref
	}

	writeValue (value) {
		if (value === undefined) {
			return this.writeUndefined()
		}
		if (value === null) {
			return this.writeNull()
		}
		if (typeof value === "boolean") {
			return this.writeBoolean(value)
		}
		if (typeof value === "number") {
			return this.writeInt(value)
		}
		if (typeof value === "string") {
			this.byteArr.writeUnsignedByte(0x06)
			return this.writeString(value)
		}
		if (value.constructor === Date) {
			return this.writeDate(value)
		}
		if (Array.isArray(value)) {
			return this.writeArray(value)
		}
		if (typeof value === "object") {
			return this.writeObject(value)
		}
	}
	readValue () {
		let type = this.byteArr.readUnsignedByte()
		switch (type) {
			case 0x00:
			return this.readUndefined()
			break
			case 0x01:
			return this.readNull()
			break
			case 0x02:
			case 0x03:
			return this.readBoolean()
			break
			case 0x04:
			return this.readInt()
			break
			case 0x05:
			return this.readDouble()
			break
			case 0x06:
			return this.readString()
			break
			case 0x07:
			throw new TypeError("AMF3::readValue - Error: XMLDoc not supported")
			break
			case 0x08:
			return this.readDate()
			break
			case 0x09:
			return this.readArray()
			break
			case 0x0A:
			return this.readObject()
			break
			case 0x0B:
			throw new TypeError("AMF3::readValue - Error: XML not supported")
			break
			case 0x0C:
			return this.readByteArray()
			break
			default:
			throw new TypeError("AMF3::readValue - Error: Unknown type")
		}
	}
	/*
	UInt29 Type.
	*/
	writeUInt29 (value) {
		if (value < 0x80) {
			this.byteArr.writeUnsignedByte(value)
		} else if (value < 0x4000) {
			this.byteArr.writeUnsignedByte(value >> 7 & 0x7F | 0x80)
			this.byteArr.writeUnsignedByte(value & 0x7F)
		} else if (value < 0x200000) {
			this.byteArr.writeUnsignedByte(value >> 14 & 0x7F | 0x80)
			this.byteArr.writeUnsignedByte(value >> 7 & 0x7F | 0x80)
			this.byteArr.writeUnsignedByte(value & 0x7F)
		} else if (value < 0x40000000) {
			this.byteArr.writeUnsignedByte(value >> 22 & 0x7F | 0x80)
			this.byteArr.writeUnsignedByte(value >> 15 & 0x7F | 0x80)
			this.byteArr.writeUnsignedByte(value >> 8 & 0x7F | 0x80)
			this.byteArr.writeUnsignedByte(value & 0xFF)
		} else {
			throw new RangeError("AMF3::writeUInt29 - Error: Integer out of range: " + value)
		}
		return this.buffer
	}
	readUInt29 () {
		var result = 0
		var b = this.byteArr.readUnsignedByte()
		if (b < 128) return b
			result = (b & 0x7F) << 7
		b = this.byteArr.readUnsignedByte()
		if (b < 128) return (result | b)
			result = (result | (b & 0x7F)) << 7
		b = this.byteArr.readUnsignedByte()
		if (b < 128) return (result | b)
			result = (result | (b & 0x7F)) << 8
		b = this.byteArr.readUnsignedByte()
		return (result | b)
	}
	/*
	3.2 Undefined Type.
	*/
	writeUndefined () {
		return this.byteArr.writeUnsignedByte(0x00)
	}
	readUndefined () {
		return {value: undefined, __traits: {type: "Undefined", special: true}}
	}
	/*
	3.3 Null Type.
	*/
	writeNull () {
		return this.byteArr.writeUnsignedByte(0x01)
	}
	readNull () {
		return {value: null, __traits: {type: "Null", special: true}}
	}
	/*
	3.4 False Type.
	3.5 True Type.
	*/
	writeBoolean (value) {
		if (typeof value !== "boolean") {
			throw new TypeError("AMF3::writeBoolean - Error: Not a boolean value")
		}
		if (value) {
			return this.byteArr.writeUnsignedByte(0x03)
		} else {
			return this.byteArr.writeUnsignedByte(0x02)
		}
	}
	readBoolean () {
		if (this.byteArr.readUnsignedByte() == 0x03) {
			return {value: true, __traits: {type: "True", length: 1}}
		} else {
			return {value: false, __traits: {type: "False", length: 1}}
		}
	}
	/*
	3.6 Integer Type.
	*/
	writeInt (value) {
		if (value >= -268435456 && value <= 268435455 && (value % 1 == 0)) {
			value &= 0x1FFFFFFF // 2^29 - 1
			this.byteArr.writeUnsignedByte(0x04)
			this.writeUInt29(value) // How many times can our integer fit?
			return this.buffer
		} else {
			return this.writeDouble(value, true)
		}
	}
	readInt () {
		if (this.byteArr.readUnsignedByte() == 0x05) { // Tried to write an AMF3 integer but it was actually a larger integer
			return this.readDouble()
		} else {
			return {value: ((this.readUInt29() << 3) >> 3), __traits: {type: "Integer"}}
		}
	}
	/*
	3.7 Double Type.
	*/
	writeDouble (value, fromInteger) {
		if (fromInteger === undefined) {
			fromInteger = false
		}
		if (fromInteger) {
			console.log("AMF3::writeDouble - Info: [AMF3::writeInt - Info: Send a large integer to AMF3::writeDouble]")
		}
		this.byteArr.writeUnsignedByte(0x05)
		this.byteArr.writeDouble(value)
	}
	readDouble () {
		return {value: this.byteArr.readDouble(), __traits: {type: "Double"}}
	}
	/*
	3.8 String Type.
	*/
	writeString (value, writeRef) {
		if (typeof value !== "string") {
			value = ""
		}
		if (value == "") {
			this.byteArr.writeUnsignedByte(0x01)
		}
		if (writeRef === undefined) {
			writeRef = false
		}
		if (writeRef) {
			if (!this.stringByReference(value)) {
				this.writeUInt29((value.length << 1) | 1)
				this.byteArr.writeUTFBytes(value)
			}
		} else {
			this.writeUInt29((value.length << 1) | 1)
			this.byteArr.writeUTFBytes(value)
		}
		return this.buffer
	}
	readString () {
		let ref = this.readUInt29()
		if ((ref & 1) == 0) return this.strings[ref >> 1]
			let str = {value: "", __traits: {type: "String", length: 0}}
		if (ref >> 1 == 0) {
			return ""
		}
		if (ref >> 1 > 0) {
			str.value = this.byteArr.readUTFBytes(ref >> 1)
			str.__traits.length = ref >> 1
			this.strings.push(str)
		}
		return str
	}
	/*
	3.10 Date Type.
	*/
	writeDate (value) {
		this.byteArr.writeUnsignedByte(0x08)
		if (!(value instanceof Date)) value = new Date(value)
			if (!this.objectByReference(value)) {
				this.writeUInt29(1)
				this.byteArr.writeDouble(value.getTime())
			}
			return this.buffer
		}
		readDate () {
			if (this.byteArr.readUnsignedByte() == 0x08) {
				let ref = this.readUInt29()
				if ((ref & 1) == 0) return this.objects[ref >> 1]
					let currentDate = this.byteArr.readDouble()
				let date = {value: new Date(currentDate).toString(), date: currentDate, __traits: {type: "Date"}}
				this.objects.push(date)
				return date
			}
		}
	/*
	3.11 Array Type.
	*/
	writeArray (value) {
		this.byteArr.writeUnsignedByte(0x09)
		if (!this.objectByReference(value)) {
			this.writeUInt29((value.length << 1) | 1)
			this.writeUInt29(1)
			if (value.length > 0) {
				for (let i = 0; i < value.length; i++) {
					this.writeValue(value[i])
				}
			}
		}
	}
	readArray () {
		if (this.byteArr.readUnsignedByte() != 0x09) {
			throw new TypeError("AMF3::readArray - Error: Not an array") // Hacky bugfix. Things break without this!
		}
		let ref = this.readUInt29()
		if ((ref & 1) == 0) return this.objects[ref >> 1]
			let len = (ref >> 1)
		let map = null
		while (true) {
			let name = this.readString()
			if (!name) {
				break
			}
			if (!map) {
				map = {}
				this.objects.push(map)
			}
			map[name] = this.readValue()
		}
		if (!map) {
			let array = new Array(len)
			this.objects.push(array)
			for (let i = 0; i < len; i++) {
				array[i] = this.readValue()
			}
			return array
		} else {
			for (let i = 0; i < len; i++) {
				map[i] = this.readValue()
			}
			return map
		}
	}
	/*
	3.12 Object Type.
	TODO: readObject.
	*/
	writeObject (value) {
		this.byteArr.writeUnsignedByte(0x0A)
		if (!this.objectByReference(value)) {
			if (!value["__class"] || value["__class"] == "") {
				this.byteArr.writeUnsignedByte(0x0B)
				this.byteArr.writeUnsignedByte(0x01)
			}
			if (value._$type) {
				this.writeString(value.type)
			}
			let keys = Object.keys(value)
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i]
				if (typeof value[key] !== "function") {
					this.writeString(key)
					this.writeValue(value[key])
				}
			}
		}
		this.byteArr.writeUnsignedByte(0x01)
	}
	readObject () {
		if (this.byteArr.readUnsignedByte() != 0x0A) {
			throw new TypeError("AMF3::readObject - Error: Not an AMF3 object marker")
		}
		let ref = this.readUInt29()
		if ((ref & 1) == 0) return this.objects[ref >> 1]
	}
	/*
	3.14 ByteArray Type.
	*/
	writeByteArray (value) {
		if (!Array.isArray(value)) {
			throw new TypeError("AMF3::writeByteArray - Error: Not an array")
		}
		this.byteArr.writeUnsignedByte(0x0c)
		if (this.objectByReference(value)) {
			this.writeUInt29(value.length << 1 | 1)
			value.forEach(int => {
				this.byteArr.writeByte(int)
			})
		}
	}
	readByteArray () {
		let ref = this.readUInt29()
		if ((ref & 1) == 0) return this.objects[ref >> 1]
			let val = {value: this.byteArr.readByteArray(ref >> 1), __traits: {type: "ByteArray"}}
		this.objects.push(val)
		return val
	}
	/*
	3.15 Dictionary Type.
	*/
	writeDictionary (value, traits) {
		this.byteArr.writeUnsignedByte(0x11)
		if (this.objectByReference(value)) {
			this.writeUInt29(value.length << 1 | 1)
			this.writeBoolean(traits.weakKeys)
			for (let i = 0; i < value.length; i++) {
				this.writeValue(value[i].value.Key)
				this.writeValue(value[i].value.Value)
			}
		}
	}
	readDictionary () {
		let ref = this.readUInt29()
		if ((ref & 1) == 0) return this.objects[ref >> 1]
			let hasWeakKeys = this.readBoolean()
		let dict = []
		for (let i = 0; i < value.length; i++) {
			dict[i] = {key: this.readValue(), value: this.readValue(), __traits: {type: "DictionaryItem"}}
		}
		let val = {value: dict, __traits: {weakKeys: hasWeakKeys, type: "Dictionary"}}
		this.objects.push(dict)
		return val
	}
	/*
	Extra Type.
	*/
	writeMap (value) {
		this.byteArr.writeUnsignedByte(0x0A)
		if (!this.objectByReference(value)) {
			this.writeUInt29(11)
			this.traitCount++
			this.writeString("", false)
			for (let key in value) {
				if (key) {
					this.writeString(key, false)
				} else {
					this.writeString("", false)
				}
				this.writeValue(value[key])
			}
			this.writeString("", false)
		}
	}
	readMap () {
		let ref = this.readUInt29()
		if ((ref & 1) == 0) return this.objects[ref >> 1]
			let map = null
		if (ref >> 1 > 0) {
			map = {}
			this.objects.push(map)
			let name = this.readValue()
			while (name != null) {
				map[name] = this.readValue()
				name = this.readValue()
			}
		}
		return map
	}
}

module.exports = AMF3