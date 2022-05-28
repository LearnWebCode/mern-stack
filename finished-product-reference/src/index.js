import Axios from "axios"
import React, { useState, useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"
import CreateNewForm from "./components/CreateNewForm"
import AnimalCard from "./components/AnimalCard"

function App() {
  const [animals, setAnimals] = useState([])

  useEffect(() => {
    async function go() {
      const response = await Axios.get("/api/animals")
      setAnimals(response.data)
    }
    go()
  }, [])

  return (
    <div className="container">
      <p>
        <a href="/">&laquo; Back to public homepage</a>
      </p>
      <CreateNewForm setAnimals={setAnimals} />
      <div className="animal-grid">
        {animals.map(animal => (
          <AnimalCard key={animal._id} name={animal.name} species={animal.species} photo={animal.photo} setAnimals={setAnimals} id={animal._id} />
        ))}
      </div>
    </div>
  )
}

const root = createRoot(document.querySelector("#app"))
root.render(<App />)
