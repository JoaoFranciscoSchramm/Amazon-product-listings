// Add click event listener to the 'scrape' button
document.getElementById('scrape').addEventListener('click', function() {
    // Get the keyword input value
    const keyword = document.getElementById('keyword').value;
    // Check if keyword is empty
    if (!keyword) {
        // Alert the user to enter a keyword if it's empty
        alert('Please enter a keyword');
        return;
    }

    // Fetch product data from the server using keyword
    fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`)
        .then(response => response.json()) // Parse response as JSON
        .then(data => {
            const results = document.getElementById('results');
            results.innerHTML = ''; // Clear previous results

            // Check for errors in response data
            if (data.error) {
                results.innerHTML = `<p>Error: ${data.error}</p>`;
                return;
            }

            // Iterate through each product and display its information
            data.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <img src="${product.image}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <p>Rating: ${product.rating}</p>
                    <p>Reviews: ${product.reviews}</p>
                `;
                results.appendChild(productDiv); // Append product info to results
            });
        })
        .catch(error => {
            // Log and display error if fetching data fails
            console.error('Error fetching data: ', error);
            document.getElementById('results').innerHTML = `<p>Error fetching data</p>`;
        });
});
