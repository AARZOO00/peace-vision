// test-server.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Peace Vision server is working!');
});

app.listen(3000, () => {
    console.log('✅ Test server running at http://localhost:3000');
});