const axios = require('axios');
const { JSDOM } = require('jsdom');
const express = require('express');
const { Readability } = require('@mozilla/readability');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/parse', async (req, res) => {
    try {
        const { url } = req.body;

        const response = await axios.get(url);
        const dom = new JSDOM(response.data, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        res.json(article);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to parse the webpage.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
