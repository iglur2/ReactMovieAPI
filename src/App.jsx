import { use, useEffect, useState } from 'react'
import './App.css'
import Search from './components/Search'
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use'

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
}
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMesage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');

  // Evita fazer muitas requisições na api ao esperar o susario parar de digitar por 500ms
  useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);
  
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMesage('');

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sprt_by=popularity.desc`

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error('Failed to fetch data');
      };
      const data = await response.json();
     
      if(data.response === 'False'){
        setErrorMesage('No movies found');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

    } catch(err) {
      console.error(err);
      setErrorMesage('Error fetching movies. Please try again later')
    } finally {
      setIsLoading(false);
    }
  }

  useEffect( () => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm])
  // ^ toda vez que o searchterm for atualizado a função sera recallada

  return (
    <main>
      <div className='pattern'/>
      <div className='wrapper'>
        <header>
          <img src='./hero.png' alt='hero banner'></img>
          <h1>Find <span className='text-gradient'>movies</span> you'll enjoy without the hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className='all-movies'>
          <br></br>
          <h2>All Movies</h2>
          
          {isLoading ? (
            <p className='text-white'>Loading...</p>
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}></MovieCard>
              ))}
            </ul>
          )}

        </section>
      </div>
    </main>
  )
}

export default App
