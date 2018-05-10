const ByteArray = require("../ByteArray")

function ByteArrayObjectExampleAMF3 () {
	const byteArr = new ByteArray();
	byteArr.writeObjectAMF3({name:"Mike", age:"30", alias:"Mike"});
	console.log("Raw stream: " + byteArr.buffer);
	console.log(byteArr);
}

function ByteArrayBufferObjectExampleAMF3 () {
	const byteArr = new ByteArray();
	const buffer = new Buffer(5); // Length can be retrieved in writeObjectAMF3 with item.length, returns '5'
	buffer.writeInt8(5, 0); // <Buffer 05 00 00 00 00>
	byteArr.writeObjectAMF3(buffer); // <Buffer 0c 0b 05>
	console.log(byteArr);
}

function ByteArrayObjectExampleAMF0 () {
	const byteArr = new ByteArray();
	byteArr.writeObjectAMF0({name:"Mike", age:"30", alias:"Mike"});
	console.log("Raw stream: " + byteArr.buffer);
	console.log(byteArr);
}

function ByteArrayExample () {
	const byteArr = new ByteArray();
	byteArr.writeBoolean(false);
	byteArr.writeDouble(Math.PI);
	byteArr.writeUTFBytes("Hello world");
	byteArr.writeDouble(new Date().getTime());
	byteArr.writeByte(69 >>> 1);
	byteArr.offset = 0;
	console.log("Raw stream: " + byteArr.buffer);
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