const tape = require("tape")
const fs = require("fs")
const ByteArray = require("../ByteArray")

tape("Write/read a byte", (v) => {
	const wba = new ByteArray()
	wba.writeByte(5)
	const rba = new ByteArray(wba)
	v.equal(rba.readByte(), 5)
	v.end()
})

tape("Write/read a boolean", (v) => {
	const wba = new ByteArray()
	wba.writeBoolean(true)
	const rba = new ByteArray(wba)
	v.equal(rba.readBoolean(), true)
	v.end()
})

tape("Write/read a byte without new constructor", (v) => {
	const wba = new ByteArray()
	wba.writeByte(10)
	wba.position = 0
	v.equal(wba.readByte(), 10)
	v.end()
})

tape("Write/read a string", (v) =>{
	const wba = new ByteArray()
	wba.writeUTF("ByteArray.js")
	const rba = new ByteArray(wba)
	v.equal(rba.readUTF(), "ByteArray.js")
	v.end()
})

tape("Write/read an object", (v) => {
	const wba = new ByteArray()
	wba.objectEncoding = 0
	wba.writeObject({id: 1})
	v.deepEqual(wba.readObject(), { len: 17, value: { id: 1 } })
	v.end()
})

tape("Write/read IEEE754 double", (v) => {
	const wba = new ByteArray()
	wba.writeDouble(1.23)
	const rba = new ByteArray(wba)
	v.equal(rba.readDouble(), 1.23)
	v.end()
})

tape("Write/read IEEE754 float", (v) => {
	const wba = new ByteArray()
	wba.writeFloat(55.12)
	const rba = new ByteArray(wba)
	v.equal(rba.readFloat(), 55.119998931884766)
	v.end()
})

tape("Compress/decompress a string", (v) => {
	const wba = new ByteArray()
	wba.writeUTF("Hello ByteArray.js!")
	wba.compress("zlib")
	wba.position = 0
	fs.readFile("test.secret", wba.uncompress("zlib"), (err, data) => {
		if (err) throw err
		v.equal(wba.readUTF(), "Hello ByteArray.js!")
	})
	v.end()
})

tape("Adobe's example", (v) => {
	const wba = new ByteArray()
	const date = new Date().getTime()
	wba.writeBoolean(false)
	wba.writeDouble(Math.PI)
	wba.writeUTFBytes("Hello world")
	wba.position = 0
	v.equal(wba.readBoolean() == false, true)
	v.equal(wba.readDouble(), 3.141592653589793)
	v.equal(wba.readUTFBytes(11), "Hello world")
	v.end()
})