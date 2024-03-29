// Add movie to the webpage
function addMovieToCarousel(movie) {
    const movieCarousel = document.getElementById('movie-carousel');
    const movieInput = document.getElementById('movie-input');


    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const movieImage = document.createElement('img');
    movieImage.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    movieImage.alt = movie.title;

    const movieTitle = document.createElement('p');
    movieTitle.textContent = movie.title;

    // Set the movie overview as a data attribute
    movieCard.dataset.overview = movie.overview;

    
    movieCard.appendChild(movieImage);

    if (movie.seen) {
        movieImage.style.filter = 'blur(5px)';

        const overlay = document.createElement('img');
        overlay.src = "assets/movie-seen.png";
        overlay.classList.add('overlay');
        movieCard.appendChild(overlay);
    }
    movieCard.appendChild(movieTitle);
    movieCarousel.prepend(movieCard);

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
        title: movie.title,
        release_date: movie.release_date, // Extract year from release_date
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        overview: movie.overview
    };

    await fetch('.netlify/functions/addMovie', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
    })
}

async function getMoviesFromSheets() {

    try {
        const movieInput = document.getElementById('movie-input');

        const response = await fetch('.netlify/functions/getMovies');
        const movies = await response.json();

        // Sorting the array in descending order based on vote_average
        movies.sort((a, b) => a.vote_average - b.vote_average);
        console.log(movies);
        movies.forEach(movie => {
            addMovieToCarousel(movie); // Assuming you already have this function
        });

        Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))).then(() => {
            document.getElementById('loading-container').style.display = 'none';
            document.getElementById('content').style.display = 'block';
        });

        //prepare input
        movieInput.addEventListener('input', async () => {
            const movieOptions = document.getElementById('movie-options');
            const searchTerm = movieInput.value.trim();
            if (searchTerm.length <= 3) {
                movieOptions.innerHTML = ''; // Clear movie options if input is empty
                return;
            }
        
            // Fetch movie options based on the user's input
            const response = await fetch(`.netlify/functions/searchMovie?searchTerm=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            // Populate movie options container with fetched movie options
            movieOptions.innerHTML = '';
            data.results.forEach(movie => {
                if (movie.poster_path) {
                    const option = document.createElement('div');
                    option.classList.add('movie-option');
                    option.innerHTML = `<img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
                                        <p>${movie.title} (${movie.release_date.split('-')[0]})</p>`;
                    option.addEventListener('click', () => {
                        addMovieToCarousel(movie);
                        addMovieToSheets(movie);
                        movieOptions.innerHTML = ''; // Clear movie options after selecting a movie
                    });
                    movieOptions.appendChild(option);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}