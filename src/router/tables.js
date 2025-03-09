const express = require('express')
const router = express.Router()
const Table = require('../models/Table')
const auth = require('../middleware/auth')
const crypto = require('crypto')

// Generate unique ID for QR code
function generateTableId(tableNumber) {
  return `${tableNumber}-${crypto.randomBytes(4).toString('hex')}`
}

// Get all tables
router.get('/', auth, async (req, res) => {
  try {
    const tables = await Table.find()
    res.json(tables)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add new table
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' })
  }
  
  try {
    const { number, section, seats } = req.body
    
    // Generate QR code identifier
    const qrCode = generateTableId(number)
    
    const table = new Table({
      number,
      section,
      seats,
      qrCode
    })
    
    await table.save()
    res.status(201).json(table)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update table status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body
    
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    
    if (!table) {
      return res.status(404).json({ message: 'Table not found' })
    }
    
    res.json(table)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router