// mongo.js
require('dotenv').config()
const mongoose = require('mongoose')

// Usamos la misma URL que ya funciona en index.js
const url = process.env.MONGODB_URI

if (!url) {
  console.log('Error: MONGODB_URI no está definido en .env')
  process.exit(1)
}

// Evita warnings de Mongoose
mongoose.set('strictQuery', false)

// Esquema simple para la colección "persons"
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// Tomamos los argumentos después de "node mongo.js"
const args = process.argv.slice(2)
// args.length puede ser 0 ó 2

if (args.length === 0) {
  // 🔹 Modo 1: listar todos los documentos
  mongoose
    .connect(url)
    .then(() => {
      console.log('phonebook:')
      return Person.find({})
    })
    .then(result => {
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      return mongoose.connection.close()
    })
    .catch(error => {
      console.log('Error al listar personas:', error.message)
      mongoose.connection.close()
    })

} else if (args.length === 2) {
  // 🔹 Modo 2: agregar una nueva persona
  const [name, number] = args

  mongoose
    .connect(url)
    .then(() => {
      const person = new Person({ name, number })
      return person.save()
    })
    .then(savedPerson => {
      console.log(`added ${savedPerson.name} number ${savedPerson.number} to phonebook`)
      return mongoose.connection.close()
    })
    .catch(error => {
      console.log('Error al guardar persona:', error.message)
      mongoose.connection.close()
    })

} else {
  // Uso incorrecto
  console.log('Uso correcto:')
  console.log('  node mongo.js')
  console.log('  node mongo.js "Nombre" "Número"')
  process.exit(1)
}