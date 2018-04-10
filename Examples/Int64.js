"use strict"

class Int64 {
	/**
	 * @param {number} low
	 * @param {number} high
	 */
	constructor (low, high) {
		this._low = low | 0
		this._high = high | 0
	}

	get low () {
		return this._low
	}

	get high () {
		return this._high
	}

	/**
	 * @param {number} low
	 */
	set low (l) {
		this._low = l
	}

	/**
	 * @param {number} high
	 */
	set high (h) {
		this._high = h
	}

	/**
	 * @param {number} number
	 */
	fromNumber (n) {
		return new Int64(n, Math.floor(n / 4294967296))
	}

	toNumber () {
		return this.high * 4294967296 + this.low
	}

	/**
	 * @param {number} radix
	 */
	toString (r) {
		return this.toNumber().toString(r || 10)
	}

	/**
	 * @param {Int64} number
	 */
	compareTo (n) {
		return this.low == n.low && this.high == n.high
	}
}
module.exports = Int64