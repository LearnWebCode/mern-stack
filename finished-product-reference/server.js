const { MongoClient, ObjectId } = require("mongodb")
const express = require("express")
const path = require("path")
const multer = require("multer")
const sharp = require("sharp")
const React = require("react")
const ReactDOMServer = require("react-dom/server")
const fse = require("fs-extra")
const upload = multer()
const sanitizeHTML = require("sanitize-html")
const AnimalCard = require("./src/AnimalCard").default

// When the app first launches, make sure the "uploaded-photos" folder exists
fse.ensureDirSync(path.join("public", "uploaded-photos"))

const app = express()
let db

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", 'Basic realm="Our MERN App"')
  // username is "admin" and password is "admin"
  if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=") {
    next()
  } else {
    res.status(401).send("Try again")
  }
}

app.set("view engine", "ejs")
app.set("views", "./views")

app.use(express.static("public"))

app.get("/", async function (req, res) {
  const animals = await db.collection("animals").find().toArray()
  let generatedHTML = ReactDOMServer.renderToString(
    <div className="container">
      {!animals.length && <p>There are no animals yet, the admin needs to add a few.</p>}
      <div className="animal-grid mb-3">
        {animals.map(animal => (
          <AnimalCard readOnly={true} key={animal._id} name={animal.name} species={animal.species} photo={animal.photo} id={animal._id} />
        ))}
      </div>
      <p>
        <a href="/admin">Login / manage the animal listings.</a>
      </p>
    </div>
  )
  res.render("home", { generatedHTML })
})

app.use(passwordProtected)

app.get("/admin", (req, res) => {
  res.render("admin")
})

app.get("/api/animals", async (req, res) => {
  const animals = await db.collection("animals").find().toArray()
  res.json(animals)
})

function ourCleanup(req, res, next) {
  if (typeof req.body.name != "string") req.body.name = ""
  if (typeof req.body.species != "string") req.body.species = ""
  if (typeof req.body._id != "string") req.body._id = ""

  req.cleanData = {
    name: sanitizeHTML(req.body.name.trim(), { allowedTags: [], allowedAttributes: {} }),
    species: sanitizeHTML(req.body.species.trim(), { allowedTags: [], allowedAttributes: {} })
  }

  next()
}

app.post("/create-animal", passwordProtected, upload.single("photo"), ourCleanup, async (req, res) => {
  if (req.file) {
    const photofilename = `${Date.now()}.jpg`
    await sharp(req.file.buffer).resize(844, 456).jpeg({ quality: 60 }).toFile(path.join("public", "uploaded-photos", photofilename))
    req.cleanData.photo = photofilename
  }

  const info = await db.collection("animals").insertOne(req.cleanData)
  const newAnimal = await db.collection("animals").findOne({ _id: new ObjectId(info.insertedId) })
  res.send(newAnimal)
})

app.post("/update-animal", passwordProtected, upload.single("photo"), ourCleanup, async (req, res) => {
  if (req.file) {
    const photofilename = `${Date.now()}.jpg`
    await sharp(req.file.buffer).resize(844, 456).jpeg({ quality: 60 }).toFile(path.join("public", "uploaded-photos", photofilename))
    req.cleanData.photo = photofilename
    const info = await db.collection("animals").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
    if (info.value.photo) {
      fse.remove(path.join("public", "uploaded-photos", info.value.photo))
    }
    res.send(photofilename)
  } else {
    db.collection("animals").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
    res.send(false)
  }
})

app.delete("/animal/:id", passwordProtected, async (req, res) => {
  if (typeof req.params.id != "string") req.params.id = ""
  const doc = await db.collection("animals").findOne({ _id: new ObjectId(req.params.id) })
  if (doc.photo) {
    fse.remove(path.join("public", "uploaded-photos", doc.photo))
  }
  db.collection("animals").deleteOne({ _id: new ObjectId(req.params.id) })
  res.send("Good job")
})

// Don't actually start our app by listening for incoming requests until we have a DB connection
async function start() {
  const client = new MongoClient("mongodb://root:root@localhost:27017/AmazingMernApp?&authSource=admin")
  await client.connect()
  db = client.db()
  app.listen(3000)
}

start()
