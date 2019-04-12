/*
  Recommend movies for me

  Suggestion platform
  - https://movie.naver.com/
  - https://movie.daum.net/main/new#slide-1-0
  - https://play.watcha.net/
 */

import {Movie, RecommendMovies, User} from "./src/recommend-movies";
import chalk from 'chalk';

const user: User = {
  favMovieType: 'horror',
  level: 6,
  favMovieDateYears: Array.from({
    length: (2019 - 2000)
  }, (v, k) => k + 2000),
  favMovieCountry: 'japan'
};

(new RecommendMovies).get(user).subscribe((movie: Movie) => {
  console.log(chalk.red.bold(`${movie.name}`));
  console.log(chalk.bold(`평정: ${movie.rating}`));
  console.log(chalk.bold(`제작일: ${movie.released.toLocaleString().slice(0,10).replace(/-/g,"").split('/').pop()}`));
  console.log('\n');
});

