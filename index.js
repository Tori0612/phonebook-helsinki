const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json())
app.use(express.static('dist'))
/*
morgan.token('body', (req) => JSON.stringify(req.body))

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)
*/

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
} 

app.use(requestLogger)


let persons = [
    { 
      id: "1",
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: "2",
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: "3",
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: "4",
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

const generateId = () => {
  let id 

  do {
    id = Math.floor(Math.random() * 1000).toString()
  } while (persons.some(p => p.id == id))

  return id
} 

const normalize = (str) => str.trim().toLowerCase()



app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/info', (req, res) => {
  const now = new Date()
  const len = persons.length

  res.send(`
    <p>Phonebook has info for ${len} people</p>
    <p>${now}</p>
  `)
})

app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id 
  const person = persons.find(p => p.id === id)
  if (person) {
    res.json(person)
  }
  res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name && !body.number) {
    return res.status(400).json({
      error: 'name and number are missing'
    })
  } else if (!body.name) {
    return res.status(400).json({
      error: 'name missing'
    })
  } else if (!body.number) {
    return res.status(400).json({
      error: 'number missing'
    })
  } else if (persons.some(p => normalize(p.name) === normalize(body.name))) {
    return res.status(400).json({
      error: 'The name already exists in the phonebook'
    })
  }

  const person = {
    name: body.name, 
    number: body.number, 
    id: generateId(),
  }

  persons = persons.concat(person)

  res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})

