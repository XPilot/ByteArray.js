# xByteArray
xByteArray provides methods and properties to optimize reading, writing, and working with binary data. xByteArray is created, because Javascript doesn't contain methods similar to Actionscript's ByteArray. xByteArray now supports reading & writing values at a specific position from and to the byte stream.
**xByteArray is all big-endian based.**

- Properties
- Standalone methods
- Reading methods
- Writing methods
- Tests and examples

# Properties
#### bytesAvailable (1024 bytes)
```
The number of bytes of data available for reading from the current position in the byte array to the end of the array.
```
#### get length
```
Return the current byte stream length.
```
#### set length
```
Sets the current byte stream length to the received value.
```
#### position
```
Moves, or returns the current position, in bytes, of the file pointer into the ByteArray object. This is the point at which the next call to a read method starts reading or a write method starts writing.
```
# Standalone methods
#### atomicCompareAndSwapIntAt
```
In a single atomic operation, compares an integer value in this byte array with another integer value and, if they match, swaps those bytes with another value.
```
#### atomicCompareAndSwapLength
```
In a single atomic operation, compares this byte array's length with a provided value and, if they match, changes the length of this byte array.
```
#### clear
```
Clears the contents of the byte array and resets the  `length`  and  `position`  properties to 0. Calling this method explicitly frees up the memory used by the ByteArray instance.
```
#### toJSON()
```
Provides an overridable method for customizing the JSON encoding of values in an ByteArray object.
```
#### toString()
```
Converts the byte array to a string. If the data in the array begins with a Unicode byte order mark, the application will honor that mark when converting to a string. If  `System.useCodePage`  is set to  `true`, the application will treat the data in the array as being in the current system code page when converting.
```
#### toFullString()
```
Returns current class information.
```
#### generateRandomBytes
```
Creates random bytes and converts them to binary and then writes it as a string to the byte stream.
```

# Reading methods
#### readBoolean
```
Reads a Boolean value from the byte stream. A single byte is read, and  `true`  is returned if the byte is nonzero,  `false`  otherwise.
```
#### readByte
```
Reads a signed byte from the byte stream.
```
#### readBytes
```
Reads the number of data bytes, specified by the  `length`  parameter, from the byte stream. The bytes are read into the ByteArray object specified by the  `bytes`  parameter, and the bytes are written into the destination ByteArray starting at the position specified by  `offset`.
```
#### readDouble
```
Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream.
```
#### readFloat
```
Reads an IEEE 754 single-precision (32-bit) floating-point number from the byte stream.
```
#### readInt
```
Reads a signed 32-bit integer from the byte stream.
```
#### readMultiByte (unicode, gb2312, ascii, utf8)
```
Reads a multibyte string of specified length from the byte stream using the specified character set.
```
#### readShort
```
Reads a signed 16-bit integer from the byte stream.
```
#### readUnsignedByte
```
Reads an unsigned byte from the byte stream.
```
#### readUnsignedInt
```
Reads an unsigned 32-bit integer from the byte stream.
```
#### readUnsignedShort
```
Reads an unsigned 16-bit integer from the byte stream.
```
#### readUTF
```
Reads a UTF-8 string from the byte stream. The string is assumed to be prefixed with an unsigned short indicating the length in bytes.
```
#### readUTFBytes
```
Reads a sequence of UTF-8 bytes specified by the  `length`  parameter from the byte stream and returns a string.
```
#### readString
```
Reads a string from the byte stream.
```
### readInt64
```
Reads a 64-bit integer from the byte stream.
```
#### readUnsignedInt64
```
Reads an unsigned 64-bit integer from the byte stream.
```
#### readDate
```
Reads an IEEE 754 double-precision (64-bit) floating-point number from the byte stream and converts it into a date.
```
# Writing methods
#### writeBoolean
```
Writes a Boolean value. A single byte is written according to the  `value`  parameter, either 1 if  `true`  or 0 if  `false`.
```
#### writeByte
```
Writes a byte to the byte stream.
```
#### writeBytes
```
Writes a sequence of  `length`  bytes from the specified byte array,  `bytes`, starting  `offset`(zero-based index) bytes into the byte stream.
```
#### writeDouble
```
Writes an IEEE 754 double-precision (64-bit) floating-point number to the byte stream.
```
#### writeFloat
```
Writes an IEEE 754 single-precision (32-bit) floating-point number to the byte stream.
```
#### writeInt
```
Writes a 32-bit signed integer to the byte stream.
```
#### writeMultiByte (unicode, gb2312, ascii, utf8)
```
Writes a multibyte string to the byte stream using the specified character set.
```
#### writeShort
```
Writes a 16-bit integer to the byte stream. The low 16 bits of the parameter are used. The high 16 bits are ignored.
```
#### writeUnsignedByte
```
Writes an unsigned byte to the byte stream.
```
#### writeUnsignedInt
```
Writes a 32-bit unsigned integer to the byte stream.
```
#### writeUnsignedShort
```
Writes an unsigned 16-bit integer to the byte stream.
```
#### writeUTF
```
Writes a UTF-8 string to the byte stream. The length of the UTF-8 string in bytes is written first, as a 16-bit integer, followed by the bytes representing the characters of the string.
```
#### writeUTFBytes
```
Writes a UTF-8 string to the byte stream. Similar to the  `writeUTF()`  method, but  `writeUTFBytes()`  does not prefix the string with a 16-bit length word.
```
#### writeString
```
Writes a string to the byte stream.
```
#### writeInt64
```
Writes a 64-bit integer to the byte stream.
```
#### writeUnsignedInt64
```
Writes an unsigned 64-bit integer to the byte stream.
```
#### writeDate
```
Writes an IEEE 754 double-precision (64-bit) floating-point date to the byte stream.
```
# Tests and examples
#### Tests
```
function Test1 () {
	let ba = new ByteArray()
	console.log(ba.length) // 1024
	console.log(ba.position) // 0
	console.log(ba.bytesAvailable) // 1024
}

function Test2 () {
	let wba = new ByteArray()
	wba.writeBoolean(true)
	wba.writeBoolean(false)
	wba.writeBoolean(true)
	let rba = new ByteArray(wba)
	console.log(rba.readBoolean()) // true
	console.log(rba.readBoolean()) // false
	console.log(rba.readBoolean()) // true
}

function Test3 () {
	let wba = new ByteArray()
	wba.writeUnsignedShort(4)
	wba.writeUnsignedShort(54)
	wba.writeUnsignedShort(15)
	let rba = new ByteArray(wba)
	console.log(rba.readUnsignedShort()) // 4
	console.log(rba.readUnsignedShort()) // 54
	console.log(rba.readUnsignedShort()) // 15
}

function Test4 () {
	let wba = new ByteArray()
	wba.writeUnsignedInt(47)
	wba.writeUnsignedInt(23)
	wba.writeUnsignedInt(15459)
	let rba = new ByteArray(wba)
	console.log(rba.readUnsignedInt()) // 47
	console.log(rba.readUnsignedInt()) // 23
	console.log(rba.readUnsignedInt()) // 15459
}

function Test5 () {
	let wba = new ByteArray()
	wba.writeUnsignedByte(6)
	wba.writeUnsignedByte(68)
	wba.writeUnsignedByte(89)
	let rba = new ByteArray(wba)
	console.log(rba.readUnsignedByte()) // 6
	console.log(rba.readUnsignedByte()) // 68
	console.log(rba.readUnsignedByte()) // 89
}

function Test6 () {
	let wba = new ByteArray()
	wba.writeShort(-59)
	wba.writeShort(-96)
	wba.writeShort(119)
	let rba = new ByteArray(wba)
	console.log(rba.readShort()) // -59
	console.log(rba.readShort()) // -96
	console.log(rba.readShort()) // 119
}

function Test7 () {
	let wba = new ByteArray()
	wba.writeInt(4)
	wba.writeInt(-9654)
	wba.writeInt(789)
	let rba = new ByteArray(wba)
	console.log(rba.readInt()) // 4
	console.log(rba.readInt()) // -9654
	console.log(rba.readInt()) // 789
}

function Test8 () {
	let wba = new ByteArray()
	wba.writeFloat(4.32658)
	wba.writeFloat(54.254)
	wba.writeFloat(15.48)
	let rba = new ByteArray(wba)
	console.log(Number(rba.readFloat().toFixed(5))) // 4.32658
	console.log(Number(rba.readFloat().toFixed(3))) // 54.254
	console.log(Number(rba.readFloat().toFixed(2))) // 15.48
}

function Test9 () {
	let wba = new ByteArray()
	wba.writeDouble(4.4)
	wba.writeDouble(2.34)
	wba.writeDouble(89.952)
	let rba = new ByteArray(wba)
	console.log(rba.readDouble()) // 4.4
	console.log(rba.readDouble()) // 2.34
	console.log(rba.readDouble()) // 89.952
}

function Test10 () {
	let wba = new ByteArray()
	wba.writeByte(5)
	wba.writeByte(9)
	wba.writeByte(27)
	let rba = new ByteArray(wba)
	console.log(rba.readByte()) // 5
	console.log(rba.readByte()) // 9
	console.log(rba.readByte()) // 27
}

function Test11 () {
	let wba = new ByteArray()
	wba.writeUTFBytes("Holiday")
	wba.writeUTFBytes("Life of street")
	wba.writeUTFBytes("NFSU 3 coming soon")
	let rba = new ByteArray(wba)
	console.log(rba.readUTFBytes(7)) // Holiday
	console.log(rba.readUTFBytes(14)) // Life of street
	console.log(rba.readUTFBytes(19)) // NFSU 3 coming soon
}

function Test12 () {
	let wba = new ByteArray()
	wba.writeUTF('You should do it')
	wba.writeUTF('Because we can do')
	wba.writeUTF('Have faith in you')
	let rba = new ByteArray(wba)
	console.log(rba.readUTF()) // You should do it
	console.log(rba.readUTF()) // Because we can do
	console.log(rba.readUTF()) // Have faith in you
}

function Test13 () {
	let wba = new ByteArray()
	wba.writeMultiByte('YOPPP', 'gb2312')
	wba.writeMultiByte('YOLOO', 'gb2312')
	wba.writeMultiByte('PILOU', 'gb2312')
	let rba = new ByteArray(wba)
	console.log(rba.readMultiByte(5, 'gb2312')) // YOPPP
	console.log(rba.readMultiByte(5, 'gb2312')) // YOLOO
	console.log(rba.readMultiByte(5, 'gb2312')) // PILOU
}

function Test14 () {
	let wba = new ByteArray()
	wba.writeMultiByte('YOPPP', 'unicode')
	wba.writeMultiByte('YOLOO', 'unicode')
	wba.writeMultiByte('PILOU', 'unicode')
	let rba = new ByteArray(wba)
	console.log(rba.readMultiByte(9, 'unicode')) // YOPPP
	console.log(rba.readMultiByte(9, 'unicode')) // YOLOO
	console.log(rba.readMultiByte(9, 'unicode')) // PILOU
}

function Test15 () {
	let wba = new ByteArray()
	wba.writeMultiByte('YOPPP', 'ascii')
	wba.writeMultiByte('YOLOO', 'ascii')
	wba.writeMultiByte('PILOU', 'ascii')
	let rba = new ByteArray(wba)
	console.log(rba.readMultiByte(5, 'ascii')) // YOPPP
	console.log(rba.readMultiByte(5, 'ascii')) // YOLOO
	console.log(rba.readMultiByte(5, 'ascii')) // PILOU
}
```

#### ByteArrayExample from Adobe
```
function ByteArrayExample () {
	let byteArr = new ByteArray()
	byteArr.writeBoolean(false)
	byteArr.writeDouble(Math.PI)
	console.log(byteArr.buffer[9]) // 64
	console.log(byteArr.buffer[10]) // 9
	//for (const pair of byteArr.buffer.entries()) {
		//console.log(pair) <- Prints all values from the byte stream
	//}
	byteArr.position = 0
	try {
		console.log(byteArr.readBoolean() == false) // true
	} catch (e) {
		console.log(e)
	}
	try {
		console.log(byteArr.readDouble()) // 3 -> 3.141592653589793
	} catch (e) {
		console.log(e)
	}
}
```
