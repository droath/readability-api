const axios = require('axios');
const { JSDOM } = require('jsdom');
const express = require('express');
const { rateLimit } = require('express-rate-limit')
const { Readability } = require('@mozilla/readability');
const { markdownToBlocks } = require('@tryfabric/martian');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const limiter = rateLimit({
    max: 100,
    windowMs: 1 * 60 * 1000,
    standardHeaders: true,
    message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);
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

app.post('/notion/convert-markdown', express.text(), async (req, res) => {
    try {
        const markdown = req.body;

        if (typeof markdown !== 'string' || markdown.trim().length === 0) {
            return res.status(400).json({
                error: 'Markdown content must be a non-empty string.'
            });
        }

        res.json({
            'blocks': markdownToBlocks(markdown)
        });
    } catch (err) {
        console.error(err);
        if (err.message.includes('specific error related to parsing')) {
            return res.status(400).json(
                { error: 'Invalid Markdown format.' }
            );
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
