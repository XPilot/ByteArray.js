hp = {}
hp.ByteArray = function () {
	this.data = []
	this.pos = 0
}
/* Write. */
hp.ByteArray.prototype.write = function (b) {
	this.data.push(b)
	this.pos++
}
hp.ByteArray.prototype.writeBoolean = function (b) {
	this.write((b ? 1 : 0) & 0xFF)
}
hp.ByteArray.prototype.writeBytes = function (b, l) {
	l = l || b.length
	for (let i = 0; i < l; i++) {
		this.write(b[i])
	}
}
hp.ByteArray.prototype.writeString = function (b) {
	for (let i = 0; i < b.length; i++) {
		this.write(b.charCodeAt(i))
	}
}
hp.ByteArray.prototype.writeIEEE754 = function (value, isLE, mLen, nBytes) {
	let e, m, c
	let eLen = (nBytes * 8) - mLen - 1
	let eMax = (1 << eLen) - 1
	let eBias = eMax >> 1
	let rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	let i = isLE ? 0 : (nBytes - 1)
	let d = isLE ? 1 : -1
	let s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	value = Math.abs(value)
	if (isNaN(value) || value === Infinity) {
		m = isNaN(value) ? 1 : 0
		e = eMax
	} else {
		e = Math.floor(Math.log(value) / Math.LN2)
		if (value * (c = Math.pow(2, -e)) < 1) {
			e--
			c *= 2
		}
		if (e + eBias >= 1) {
			value += rt / c
		} else {
			value += rt * Math.pow(2, 1 - eBias)
		}
		if (value * c >= 2) {
			e++
			c /= 2
		}
		if (e + eBias >= eMax) {
			m = 0
			e = eMax
		} else if (e + eBias >= 1) {
			m = ((value * c) - 1) * Math.pow(2, mLen)
			e = e + eBias
		} else {
			m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
			e = 0
		}
	}
	for (; mLen >= 8; this.data[this.pos + i] = m & 0xff, i += d, m /= 256, mLen -= 8) { }
	e = (e << mLen) | m
	eLen += mLen
	for (; eLen > 0; this.data[this.pos + i] = e & 0xff, i += d, e /= 256, eLen -= 8) { }
	this.data[this.pos + i - d] |= s * 128
}
/* Big endian. */
hp.ByteArray.prototype.writeInt16BE = function (b) {
	if (b > 0x7FFF || b < -0x8000) throw new RangeError(`writeInt16BE - Error: ${b} is out of bounds`)
	this.write((b >>> 8) & 0xFF)
	this.write((b >>> 0) & 0xFF)
}
hp.ByteArray.prototype.writeInt32BE = function (b) {
	if (b > 0x7FFFFFFF || b < -0x80000000) throw new RangeError(`writeInt32BE - Error: ${b} is out of bounds`)
	if (b < 0) b = 0xFFFFFFFF + b + 1
	this.write((b >>> 24) & 0xFF)
	this.write((b >>> 16) & 0xFF)
	this.write((b >>> 8) & 0xFF)
	this.write((b >>> 0) & 0xFF)
}
hp.ByteArray.prototype.writeUInt16BE = function (b) {
	if (b > 0xFFFF || b < 0) throw new RangeError(`writeUInt16BE - Error: ${b} is out of bounds`)
	this.write((b >>> 8) & 0xFF)
	this.write((b >>> 0) & 0xFF)
}
hp.ByteArray.prototype.writeUInt32BE = function (b) {
	if (b > 0xFFFFFFFF || b < 0) throw new RangeError(`writeUInt32BE - Error: ${b} is out of bounds`)
	this.write((b >>> 24) & 0xFF)
	this.write((b >>> 16) & 0xFF)
	this.write((b >>> 8) & 0xFF)
	this.write((b >>> 0) & 0xFF)
}
hp.ByteArray.prototype.writeFloat16BE = function (b) {
	this.writeIEEE754(b, false, 10, 2)
	this.pos = 2
}
hp.ByteArray.prototype.writeFloatBE = function (b) {
	this.writeIEEE754(b, false, 23, 4)
	this.pos = 4
}
hp.ByteArray.prototype.writeDoubleBE = function (b) {
	this.writeIEEE754(b, false, 52, 8)
	this.pos = 8
}
/* Little endian. */
hp.ByteArray.prototype.writeInt16LE = function (b) {
	if (b > 0x7FFF || b < -0x8000) throw new RangeError(`writeInt16LE - Error: ${b} is out of bounds`)
	this.write((b >>> 0) & 0xFF)
	this.write((b >>> 8) & 0xFF)
}
hp.ByteArray.prototype.writeInt32LE = function (b) {
	if (b > 0x7FFFFFFF || b < -0x80000000) throw new RangeError(`writeInt32LE - Error: ${b} is out of bounds`)
	this.write((b >>> 0) & 0xFF)
	this.write((b >>> 8) & 0xFF)
	this.write((b >>> 16) & 0xFF)
	this.write((b >>> 24) & 0xFF)
}
hp.ByteArray.prototype.writeUInt16LE = function (b) {
	if (b > 0xFFFF || b < 0) throw new RangeError(`writeUInt16LE - Error: ${b} is out of bounds`)
	this.write((b >>> 0) & 0xFF)
	this.write((b >>> 8) & 0xFF)
}
hp.ByteArray.prototype.writeUInt32LE = function (b) {
	if (b > 0xFFFFFFFF || b < 0) throw new RangeError(`writeUInt32LE - Error: ${b} is out of bounds`)
	this.write((b >>> 0) & 0xFF)
	this.write((b >>> 8) & 0xFF)
	this.write((b >>> 16) & 0xFF)
	this.write((b >>> 24) & 0xFF)
}
hp.ByteArray.prototype.writeFloat16LE = function (b) {
	this.writeIEEE754(b, true, 10, 2)
	this.pos = 2
}
hp.ByteArray.prototype.writeFloatLE = function (b) {
	this.writeIEEE754(b, true, 23, 4)
	this.pos = 4
}
hp.ByteArray.prototype.writeDoubleLE = function (b) {
	this.writeIEEE754(b, true, 52, 8)
	this.pos = 8
}
/* Read. */
hp.ByteArray.prototype.read = function () {
	return (this.data[this.pos++] & 0xFF)
}
hp.ByteArray.prototype.readBoolean = function () {
	return this.read() ? true : false
}
hp.ByteArray.prototype.readBytes = function (l) {
	if (l > this.data.length) throw new RangeError(`readBytes - Error: ${l} is out of bounds`)
	let b = []
	for (let i = 0; i < l; i++) {
		b.push(this.data[i])
	}
	return b
}
hp.ByteArray.prototype.readString = function (l) {
	if (l > this.data.length) throw new RangeError(`readString - Error: ${l} is out of bounds`)
	let b = ""
	for (let i = 0; i < l; i++) {
		b += String.fromCharCode(this.data[i])
	}
	return b
}
hp.ByteArray.prototype.readIEEE754 = function (isLE, mLen, nBytes) {
	let e, m
	let eLen = (nBytes * 8) - mLen - 1
	let eMax = (1 << eLen) - 1
	let eBias = eMax >> 1
	let nBits = -7
	let i = isLE ? (nBytes - 1) : 0
	let d = isLE ? -1 : 1
	let s = this.data[this.pos + i - nBytes]
	i += d
	e = s & ((1 << (-nBits)) - 1)
	s >>= (-nBits)
	nBits += eLen
	for (; nBits > 0; e = (e * 256) + this.data[this.pos + i - nBytes], i += d, nBits -= 8) { }
	m = e & ((1 << (-nBits)) - 1)
	e >>= (-nBits)
	nBits += mLen
	for (; nBits > 0; m = (m * 256) + this.data[this.pos + i - nBytes], i += d, nBits -= 8) { }
	if (e === 0) {
		e = 1 - eBias
	} else if (e === eMax) {
		return m ? NaN : ((s ? -1 : 1) * Infinity)
	} else {
		m = m + Math.pow(2, mLen)
		e = e - eBias
	}
	return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}
/* Big endian. */
hp.ByteArray.prototype.readInt16BE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readInt16BE - Error: ${this.pos} is not uint`)
	let pos = (this.pos) - 2
	let b = ((this.data[pos] & 0xFF) << 8) |
		((this.data[++pos] & 0xFF) << 0)
	return (b >= 32768) ? b - 65536 : b
}
hp.ByteArray.prototype.readInt32BE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readInt32BE - Error: ${this.pos} is not uint`)
	let pos = (this.pos) - 4
	let b = ((this.data[pos] & 0xFF) << 24) |
		((this.data[++pos] & 0xFF) << 16) |
		((this.data[++pos] & 0xFF) << 8) |
		((this.data[++pos] & 0xFF) << 0)
	return (b >= 2147483648) ? b - 4294967296 : b
}
hp.ByteArray.prototype.readUInt16BE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readUInt16BE - Error: ${this.pos} is not uint`)
	let pos = (this.pos) - 2
	return ((this.data[pos] & 0xFF) << 8) |
		((this.data[++pos] & 0xFF) << 0)
}
hp.ByteArray.prototype.readUInt32BE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readUInt32BE - Error: ${this.pos} is not uint`)
	let pos = (this.pos) - 4
	return ((this.data[pos] & 0xFF) << 24) |
		((this.data[++pos] & 0xFF) << 16) |
		((this.data[++pos] & 0xFF) << 8) |
		((this.data[++pos] & 0xFF) << 0)
}
hp.ByteArray.prototype.readFloat16BE = function () {
	return this.readIEEE754(false, 10, 2)
}
hp.ByteArray.prototype.readFloatBE = function () {
	return this.readIEEE754(false, 23, 4)
}
hp.ByteArray.prototype.readDoubleBE = function () {
	return this.readIEEE754(false, 52, 8)
}
/* Little endian. */
hp.ByteArray.prototype.readInt16LE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readInt16LE - Error: ${this.pos} is not uint`)
	let pos = (this.pos)
	let b = ((this.data[--pos] & 0xFF) << 8) |
		((this.data[--pos] & 0xFF) << 0)
	return (b >= 32768) ? b - 65536 : b
}
hp.ByteArray.prototype.readInt32LE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readInt32LE - Error: ${this.pos} is not uint`)
	let pos = (this.pos)
	let b = ((this.data[--pos] & 0xFF) << 24) |
		((this.data[--pos] & 0xFF) << 16) |
		((this.data[--pos] & 0xFF) << 8) |
		((this.data[--pos] & 0xFF) << 0)
	return (b >= 2147483648) ? b - 4294967296 : b
}
hp.ByteArray.prototype.readUInt16LE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readUInt16LE - Error: ${this.pos} is not uint`)
	let pos = (this.pos)
	return ((this.data[--pos] & 0xFF) << 8) |
		((this.data[--pos] & 0xFF) << 0)
}
hp.ByteArray.prototype.readUInt32LE = function () {
	if ((this.pos % 1) !== 0 || this.pos < 0) throw new RangeError(`readUInt32LE - Error: ${this.pos} is not uint`)
	let pos = (this.pos)
	return ((this.data[--pos] & 0xFF) << 24) |
		((this.data[--pos] & 0xFF) << 16) |
		((this.data[--pos] & 0xFF) << 8) |
		((this.data[--pos] & 0xFF) << 0)
}
hp.ByteArray.prototype.readFloat16LE = function () {
	return this.readIEEE754(true, 10, 2)
}
hp.ByteArray.prototype.readFloatLE = function () {
	return this.readIEEE754(true, 23, 4)
}
hp.ByteArray.prototype.readDoubleLE = function () {
	return this.readIEEE754(true, 52, 8)
}