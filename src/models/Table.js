const mongoose = require('mongoose')

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  section: { type: String },
  seats: { type: Number, default: 4 },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved'], 
    default: 'available' 
  },
  qrCode: { type: String }
})

module.exports = mongoose.model('Table', tableSchema)