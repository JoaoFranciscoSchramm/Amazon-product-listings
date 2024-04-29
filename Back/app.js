
// Import required modules
const express = require('express'); // Importing Express framework
const axios = require('axios'); // Importing Axios for making HTTP requests
const { JSDOM } = require('jsdom'); // Importing JSDOM for DOM manipulation
const cors = require('cors'); // Importing CORS middleware

// Initializing Express app
const app = express();
const port = 3000; // Setting port number

// Enable CORS for all routes
app.use(cors());
// Serving static files from 'public' directory
app.use(express.static('public'));

// API endpoint for scraping Amazon
app.get('/api/scrape', async(req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    try {
        // Scraping Amazon for product data
        const data = await scrapeAmazon(keyword);
        res.json(data);
    } catch (error) {
        // Handling errors
        res.status(500).json({ error: error.message });
    }
});

// Function to scrape Amazon for product data
async function scrapeAmazon(keyword) {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    try {
        // Making GET request to Amazon
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        // Parsing HTML response using JSDOM
        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Extracting product information from DOM
        const products = [...document.querySelectorAll('.s-result-item')].map(el => ({
            title: el.querySelector('h2 a span')?.textContent || 'No title',
            rating: el.querySelector('.a-icon-alt')?.textContent.split(' out of')[0] || 'No rating',
            reviews: el.querySelector('.a-size-base .a-color-secondary')?.textContent || 'No reviews',
            image: el.querySelector('.s-image')?.src || 'No image'
        }));

        // Filtering out products without titles
        return products.filter(product => product.title !== 'No title');
    } catch (error) {
        // Handling specific errors
        if (error.response && error.response.status === 503) {
            console.error('Amazon is temporarily unavailable. Error 503.');
        } else {
            console.error('Error scraping Amazon:', error);
        }
        // Throwing a custom error message
        throw new Error('Failed to scrape Amazon due to network or server error.');
    }
}

// Starting the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});