const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Target URL
const TARGET_URL = 'https://chika-feed-talk.base44.app/';

// Middleware to handle all requests
app.get('/*', async (req, res) => {
  try {
    // Get the path from the request
    const path = req.params[0] || '';
    const fullUrl = `${TARGET_URL}${path}`;

    console.log(`Proxying: ${fullUrl}`);

    // Fetch the original page
    const response = await axios.get(fullUrl, {
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    // Get the HTML content
    let html = response.data;

    // Load into Cheerio for manipulation
    const $ = cheerio.load(html);

    // Remove the badge element
    $('#base44-edit-badge').remove();

    // Also remove by the close button if needed
    $('#badge-close').remove();

    // Generate the modified HTML
    const modifiedHtml = $.html();

    // Send the modified HTML back
    res.set('Content-Type', 'text/html');
    res.send(modifiedHtml);

  } catch (error) {
    console.error('Error fetching or processing:', error.message);
    res.status(500).send(`
      <h1>Proxy Error</h1>
      <p>Could not fetch the page. Please try again later.</p>
      <p>Error: ${error.message}</p>
    `);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Base44 proxy server running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});
