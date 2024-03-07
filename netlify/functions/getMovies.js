import fetch from 'node-fetch'

export const handler = async () => {
    const sheetURL = process.env.SHEET_URL

    const response = await fetch(sheetURL);
    const movies = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(movies)
      }
}