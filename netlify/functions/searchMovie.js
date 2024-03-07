import fetch from 'node-fetch';

export const handler = async (event) => {
    // Extracting searchTerm from the query string parameters
    const searchTerm = event.queryStringParameters.searchTerm;

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.API_KEY}`
        }
    };

    // Fetch movie options based on the user's input
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchTerm)}`, options);
    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data),
    };
};
