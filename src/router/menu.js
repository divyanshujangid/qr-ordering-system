const express = require('express')
const router = express.Router()
const MenuItem = require('../models/Menu')
const auth = require('../middleware/auth')

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.find()
    res.json(menuItems)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get menu items by category
router.get('/category/:category', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ category: req.params.category })
    res.json(menuItems)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add new menu item (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' })
  }
  
  try {
    const menuItem = new MenuItem(req.body)
    await menuItem.save()
    res.status(201).json(menuItem)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update menu item
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' })
  }
  
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' })
    }
    res.json(menuItem)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete menu item
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' })
  }
  
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id)
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' })
    }
    res.json({ message: 'Menu item deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router