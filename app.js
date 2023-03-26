import express from "express"
import bodyParser from "body-parser"
import date from "./date.js"
import mongoose from "mongoose"

const app = express()

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }))

// Connect to MongoDB
mongoose
	.connect("mongodb://127.0.0.1:27017/todo-listDB", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.log(err))

// Define items schema and model
const itemsSchema = {
	name: String,
}

const listSchema = {
	name: String,
	items: [itemsSchema],
}

const List = mongoose.model("List", listSchema)

const Item = mongoose.model("Item", itemsSchema)

const defaultItems = [
	{ name: "Item 1" },
	{ name: "Item 2" },
	{ name: "Item 3" },
]

app.get("/", async function (req, res) {
	const day = date.getDate()
	try {
		const items = await Item.find()
		if (items.length === 0) {
			await Item.insertMany(defaultItems)
			console.log("Items inserted successfully")
		}
		res.render("list", { listTitle: day, newItems: items })
	} catch (err) {
		console.log(err)
	}
})

// app.get("/work", function (req, res) {
// 	const workItems = []
// 	res.render("list", { listTitle: "Work List", newItems: workItems })
// })

app.get("/:customListName", (req, res) => {
	const customListName = req.params.customListName

	List.findOne({ name: customListName })
		.then((foundList) => {
			if (!foundList) {
				const list = new List({
					name: customListName,
					items: defaultItems,
				})
				list.save()

				res.redirect('/' + customListName)
			}
			else {
				res.render("list", { listTitle: foundList.name, newItems: foundList.items })
			}
		})
		.catch((err) => console.log(err))
})

app.get("/about", function (req, res) {
	res.render("about")
})

app.post("/", function (req, res) {
	const itemName = req.body.newItem
	const item = new Item({ name: itemName })
	item.save()
	res.redirect("/")
})

app.post("/delete", async (req, res) => {
	const itemId = req.body.checkbox
	await Item.deleteOne({ _id: itemId })
	res.redirect("/")
})

app.post("/work", function (req, res) {
	const work = req.body.newItem
	const workItem = new Item({ name: work })
	workItem.save()
	res.redirect("/work")
})

app.listen(8080, function () {
	console.log("listening on 8080")
})
