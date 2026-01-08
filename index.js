require('dotenv').config()

const express = require('express')

const app = express()
app.use(express.json())
app.use(express.static('dist'))


// Middlewares -----------------

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
} 

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatated id' })
  } else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ error: messages[0] })
  }
  next(err)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// -----------------------------


const Person = require('./models/person')

app.use(requestLogger)

const normalize = (str) => str.trim().toLowerCase()

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/info', (req, res) => {
  const now = new Date()
  Person.find({}).then(persons => {
    res.json(persons)
    const len = persons.length
    res.send(`
      <p>Phonebook has info for ${len} people</p>
      <p>${now}</p>
    `)
  })
})

app.get('/api/persons/:id', (req, res) => { 
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    }
    res.status(404).end()
  })
})

app.delete('/api/persons/:id', (req, res) => {
  Person.findOneAndDelete({ id: req.params.id }).then(() => {
    res.status(204).end()
  })
})

app.post('/api/persons', async (req, res, next) => {
  const body = req.body

  const alreadyExists = await Person.exists({ name: new RegExp(`^${body.name}$`, 'i') })

  if (alreadyExists) {
    return res.status(400).json({
      error: 'The name already exists in the phonebook'
    })
  }

  const person = new Person({
    name: body.name, 
    number: body.number, 
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(err => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findById(req.params.id)
    .then(person => {
      if (!person) {
        return res.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        res.json(updatedPerson)
      })
    })
    .catch(err => next(err))
})

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})

