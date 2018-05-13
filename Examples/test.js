const ByteArray = require("../ByteArray")

function ObjectExample () {
	const byteArr = new ByteArray()
	byteArr.objectEncoding = "0"
	byteArr.writeObject({id: 1})
	console.log(byteArr.readObject(byteArr.buffer))
}

function ByteArrayExample () {
	const byteArr = new ByteArray()
	byteArr.writeBoolean(false)
	byteArr.writeDouble(Math.PI)
	byteArr.writeUTFBytes("Hello world")
	byteArr.writeDouble(new Date().getTime())
	byteArr.writeByte(69 >>> 1)
	byteArr.offset = 0
	console.log("Raw stream: " + byteArr.buffer)
	try {
		console.log(byteArr.readBoolean() === false) // true
	} catch (e) {
		if (e instanceof RangeError) {
			console.log("Trying to access beyond buffer length") // EOFError
		}
	} try {
		console.log("My favorite PI: " + byteArr.readDouble()) // 3.141592653589793
	} catch (e) {
		if (e instanceof RangeError) {
			console.log("Trying to access beyond buffer length") // EOFError
		}
	} try {
		console.log("The secret message is: " + byteArr.readUTFBytes(11))
	} catch (e) {
		if (e instanceof RangeError) {
			console.log("Trying to access beyond buffer length") // EOFError
		}
	} try {
		console.log("The date is: " + new Date(byteArr.readDouble()))
	} catch (e) {
		if (e instanceof RangeError) {
			console.log("Trying to access beyond buffer length") // EOFError
		}
	} try {
		console.log("The secret number is: " + Math.round(byteArr.readByte() / 1 * 2.02)) // 69
	} catch (e) {
		if (e instanceof RangeError) {
			console.log("Trying to access beyond buffer length") // EOFError
		}
	}
}