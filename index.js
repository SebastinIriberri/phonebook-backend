require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const Person = require('./models/person')

const app = express()

// ================== Conexión a MongoDB ==================
const url = process.env.MONGODB_URI
console.log('MONGODB_URI:', url)

mongoose.set('strictQuery', false)
mongoose
  .connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message)
  })

// ================== Middlewares básicos ==================
app.use(cors())
app.use(express.json())

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

// ================== Rutas ==================

// 3.13 – GET all persons desde MongoDB
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

// 3.16 / 3.17 – Página de info usando MongoDB
app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      const date = new Date()
      res.send(
        `<p>Phonebook has info for ${count} people</p><p>${date}</p>`
      )
    })
    .catch(error => next(error))
})

// 3.14 – GET una persona por id (Mongo)
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))   // pasa error al middleware
})

// 3.15 – POST: crear persona en MongoDB
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

// 3.17 – PUT: actualizar número de una persona
app.put('/api/persons/:id', (req, res, next) => {
  const { number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { number },
    {
      new: true,
      runValidators: true,   // 👈 ejecuta validaciones
      context: 'query',      // 👈 necesario para algunos validadores en update
    }
  )
    .then(updatedPerson => {
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// 3.16 – DELETE: eliminar persona de MongoDB
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

// ================== Middlewares de errores ==================

// 3.18 – middleware para rutas desconocidas
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// 3.18 – middleware para manejo de errores
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    // id malformado (ObjectId inválido)
    return res.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    //  errores de Mongoose (minLength, required, validadores, etc.)
    return res.status(400).json({ error: error.message })
  }

  // Si no es un error que conozcamos, lo manda al default
  next(error)
}
app.use(errorHandler)

// ================== Arranque del servidor ==================
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
