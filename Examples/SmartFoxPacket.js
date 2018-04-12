const xByteArray = require("./xByteArray")

class SmartFoxPacket {
	constructor () {
		this.socketConnection = new xByteArray()
	}

	makeXmlHeader (headerObj) {
		let xmlData = "<msg"
		for (var item in headerObj) {
			xmlData += " " + item + "='" + headerObj[item] + "'"
		}
		xmlData += ">"
		return xmlData
	}

	sendXtMessage (xtName, cmd, paramObj, type = "xml", roomId = -1) {
		if (cmd == "readyToPlay")
			console.log("roomId: " + roomId)
		if (type == "xml") {
			let header = {t:"xt"}
			let xtReq = {name: xtName, cmd: cmd, param: paramObj}
			let xmlmsg = "<![CDATA[" + this.serialize(xtReq) + "]]>"
			this.send(header, "xtReq", roomId, xmlmsg)
		} else if (type == "str") {
			let MSG_STR = "%"
			let hdr = MSG_STR + "xt" + MSG_STR + xtName + MSG_STR + cmd + MSG_STR + roomId + MSG_STR
			for (var i = 0; i < paramObj.length; i++)
				hdr += paramObj[i].toString() + MSG_STR
			this.sendString(hdr)
		} else if (type == "json") {
			let body = {}
			body.x = xtName
			body.c = cmd
			body.r = roomId
			body.p = paramObj
			let obj = {}
			obj.t = "xt"
			obj.b = body
			let msg = JSON.stringify(obj)
			this.sendJson(msg)
		}
	}

	obj2xml (srcObj, trgObj, depth = 0, objName = "") {
		if (depth == 0) {
			trgObj.xmlStr = "<dataObj>" + ""
		} else {
			let ot = srcObj ? "a" : "o"
			trgObj.xmlStr += "<obj t='" + ot + "' o='" + objName + "'>" + ""
		}
		for (var i in srcObj) {
			let t = typeof srcObj[i]
			let o = srcObj[i]
			if ((t == "boolean") || (t == "number") || (t == "string") || (t == "null")) {
				if (t == "boolean") {
					o = Number(0)
				} else if (t == "null") {
					t = "x"
					o = ""
				} else if (t == "string") {
					o = this.encodeEntities(o)
				}
				trgObj.xmlStr += "<var n='" + i + "' t='" + t.substr(0,1) + "'>" + o + "</var>" + ""
			} else if (t == "object") {
				this.obj2xml(o, trgObj, depth + 1, i)
				trgObj.xmlStr += "</obj>" + ""
			}
		}
		if (depth == 0) {
			trgObj.xmlStr += "</dataObj>" + ""
		}
	}

	encodeEntities (st) {
		let ascTab = []
		ascTab[">"] = "&gt;"
		ascTab["<"] = "&lt;"
		ascTab["&"] = "&amp;"
		ascTab["'"] = "&apos;"
		ascTab["\""] = "&quot;"
		let strbuff = ""
		for (var i = 0; i < st.length; i++) {
			let ch = st.charAt(i)
			let cod = st.charCodeAt(i)
			if (cod == 9 || cod == 10 || cod == 13) {
				strbuff += ch
			} else if (cod >= 32 && cod <= 126) {
				if (ascTab[ch] != null) {
					strbuff += ascTab[ch]
				} else {
					strbuff += ch
				}
			} else {
				strbuff += ch
			}
		}
		return strbuff
	}

	serialize (o) {
		let result = {}
		this.obj2xml(o, result)
		return result.xmlStr
	}

	send (header, action, fromRoom, message) {
		let xmlMsg = this.makeXmlHeader(header)
		xmlMsg += "<body action='" + action + "' r='" + fromRoom + "'>" + message + "</body>" + "</msg>"
		console.log("[Sending]: " + xmlMsg + "\n")
		this.writeToSocket(xmlMsg)
	}

	sendString (strMessage) {
		console.log("[Sending - STR]: " + strMessage + "\n")
		this.writeToSocket(strMessage)
	}

	sendJson (jsMessage) {
		console.log("[Sending - JSON]: " + jsMessage + "\n")
		this.writeToSocket(jsMessage)
	}

	writeToSocket (msg) {
		let byteBuff = new xByteArray()
		byteBuff.writeUTFBytes(msg)
		byteBuff.writeByte(0)
		this.socketConnection.writeBytes(byteBuff)
		//this.socketConnection.clear()
	}
}

let p1 = new SmartFoxPacket()
p1.sendXtMessage("Main", "symisgay", new Object(), "xml");
console.log(p1)