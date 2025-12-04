// models/person.js
const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    minLength: 8,
    validate: {
      validator: (value) => {
        if (!value) return false

        // Debe tener al menos 8 caracteres
        if (value.length < 8) return false

        const parts = value.split('-')

        // Sin guion: solo dígitos
        if (parts.length === 1) {
          return /^\d+$/.test(value)
        }

        // Más de un guion → inválido
        if (parts.length !== 2) {
          return false
        }

        const [first, second] = parts

        // Primer bloque: 2 o 3 dígitos
        if (!/^\d{2,3}$/.test(first)) return false

        // Segundo bloque: todos dígitos
        if (!/^\d+$/.test(second)) return false

        return true
      },
      message: props => `${props.value} is not a valid phone number`
    }
  },
})

// Para que el JSON que devolvemos sea más bonito
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)