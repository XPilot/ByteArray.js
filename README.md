# ByteArray

#### ByteArray provides methods and properties to optimize reading, writing, and working with binary data. This also includes writing 29 unsigned integers, signed integers and reading 29 unsigned integers or signed integers (AMF).

- Properties
- Standalone methods
- Reading methods
- Writing methods

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
