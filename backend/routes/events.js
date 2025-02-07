const express = require('express');
const Event = require('../models/Event');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create Event
router.post('/', verifyToken, async (req, res) => {
    const { name, description, date } = req.body;
    const event = new Event({
        name,
        description,
        date,
        owner: req.user.id,
    });

    try {
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event' });
    }
});

// Get All Events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().populate('owner', 'username');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Get Event by ID
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('owner', 'username');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event' });
    }
});

// Update Event
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error updating event' });
    }
});

// Delete Event
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event' });
    }
});

module.exports = router;