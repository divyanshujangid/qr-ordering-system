const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body
    
    // Check if user exists
    const userExists = await User.findOne({ username })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role
    })
    
    await user.save()
    
    res.status(201).json({ message: 'User created successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // Check if user exists
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
    
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router