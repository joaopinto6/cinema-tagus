const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`
    }
};

const movieInput = document.getElementById('movie-input');
const movieOptions = document.getElementById('movie-options');
const movieCarousel = document.getElementById('movie-carousel');

// Search dynamically movies as the user types
movieInput.addEventListener('input', async () => {
    const searchTerm = movieInput.value.trim();
    if (!searchTerm || searchTerm.length <= 3) {
        movieOptions.innerHTML = ''; // Clear movie options if input is empty
        return;
    }

    // Fetch movie options based on the user's input
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchTerm)}`, options);
    const data = await response.json();
    
    // Populate movie options container with fetched movie options
    movieOptions.innerHTML = '';
    data.results.forEach(movie => {
        if (movie.poster_path) {
            const option = document.createElement('div');
            option.classList.add('movie-option');
            option.innerHTML = `<img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.original_title}">
                                <p>${movie.original_title} (${movie.release_date.split('-')[0]})</p>`;
            option.addEventListener('click', () => {
                addMovieToCarousel(movie);
                addMovieToSheets(movie);
                movieOptions.innerHTML = ''; // Clear movie options after selecting a movie
            });
            movieOptions.appendChild(option);
        }
    });
});

// Add movie to the webpage
function addMovieToCarousel(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const movieImage = document.createElement('img');
    movieImage.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    movieImage.alt = movie.original_title;

    const movieTitle = document.createElement('p');
    movieTitle.textContent = movie.original_title;

    // Set the movie overview as a data attribute
    movieCard.dataset.overview = movie.overview;

    movieCard.appendChild(movieImage);
    movieCard.appendChild(movieTitle);
    movieCarousel.appendChild(movieCard);

    movieInput.value = ''; // Clear input after search

    // Add event listener to the movie card
    movieCard.addEventListener('click', () => {
        const overview = movieCard.dataset.overview;
        showMovieOverview(overview);
    }); // Ensure the event listener is triggered only once
}

// Function to show the modal with movie overview
function showMovieOverview(overview) {
    const modal = document.getElementById('movie-overview-modal');
    const span = document.getElementsByClassName("close")[0];
    const overviewText = document.getElementById('movie-overview-text');
  
    overviewText.innerText = overview; // Set the text of the modal
    modal.style.display = "block"; // Show the modal
  
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

async function addMovieToSheets(movie) {
    const movieData = {
        original_title: movie.original_title,
        release_date: movie.release_date, // Extract year from release_date
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        overview: movie.overview
    };

    try {
        const response = await fetch(process.env.SHEET_URL, {
            method: 'POST',
            mode: 'no-cors', // Since we're dealing with a cross-origin request
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(movieData)
        });

        // Check if the request was successful
        if (response.ok) {
            console.log('Movie added to Google Sheets successfully');
        } else {
            console.error('Failed to add movie to Google Sheets');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getMoviesFromSheets() {

    try {
        const response = await fetch(process.env.SHEET_URL);
        const movies = await response.json();
        // Sorting the array in descending order based on vote_average
        movies.sort((a, b) => b.vote_average - a.vote_average);
        console.log(movies);
        movies.forEach(movie => {
            addMovieToCarousel(movie); // Assuming you already have this function
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}