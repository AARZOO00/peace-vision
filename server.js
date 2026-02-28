const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// GET bookings
app.get('/api/bookings', (req, res) => {
    fs.readFile('bookings.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read bookings' });
        }
        res.json(JSON.parse(data));
    });
});

// POST new booking
app.post('/api/save-booking', (req, res) => {
    const { bookings } = req.body;
    
    fs.writeFile('bookings.json', JSON.stringify({ bookings }, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save booking' });
        }
        res.json({ success: true });
    });
});

// GET bookings by date
app.get('/api/bookings/:date', (req, res) => {
    const date = req.params.date;
    
    fs.readFile('bookings.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read bookings' });
        }
        
        const allBookings = JSON.parse(data).bookings;
        const dateBookings = allBookings.filter(b => b.date === date);
        res.json({ bookings: dateBookings });
    });
});

app.listen(port, () => {
    console.log(`Peace Vision server running at http://localhost:${port}`);
});