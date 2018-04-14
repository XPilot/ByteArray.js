const fs = require("fs")
const morgan = require("morgan")
const express = require("express")
const app = express()
const port = 5000

app.use(morgan("common"))
app.use(express.static(__dirname + "/html"))
app.disable("x-powered-by")

app.get("/", (req, res) => {
	res.sendfile("./html/index.html")
	res.set("Content-Type", "text/html")
})

app.get("/writeInt8", (req, res) => {
	res.sendfile("./html/writeInt8.html")
	res.set("Content-Type", "text/html")
})

app.get("/writeInt16", (req, res) => {
	res.sendfile("./html/writeInt16.html")
	res.set("Content-Type", "text/html")
})

app.get("/writeInt24", (req, res) => {
	res.sendfile("./html/writeInt24.html")
	res.set("Content-Type", "text/html")
})

app.get("/writeInt32", (req, res) => {
	res.sendfile("./html/writeInt32.html")
	res.set("Content-Type", "text/html")
})

app.listen(port, () => {
	console.log("Listening on address 127.0.0.1:" + port)
})