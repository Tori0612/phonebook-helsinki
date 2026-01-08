const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url, { family: 4 })
  .then(() => {
    console.log('connected to mongodb')
  })
  .catch(err => {
    console.log('error connecting to mongodb', err.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  }, 
  number: {
    type: String,
    validate: {
      validator: (v) => /\d{2,3}-\d{5,}/.test(v),
      message: props => `${props.value} is not a valid phone number`
    }, 
    required: [true, "User phone number required"]
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
