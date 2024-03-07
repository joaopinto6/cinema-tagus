import fetch from 'node-fetch';

export const handler = async (event) => {

    const movie = JSON.parse(event.body);

    const response = await fetch(process.env.SHEET_URL, {
        method: 'POST',
        mode: 'no-cors', // Since we're dealing with a cross-origin request
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movie)
    });

    // Check if the request was successful
    if (response.ok) {
        console.log('Movie added to Google Sheets successfully');
    } else {
        console.error('Failed to add movie to Google Sheets');
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Done',
          }),
    };
};
