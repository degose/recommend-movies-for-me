"use strict";
/*
  Recommend movies for me

  Suggestion platform
  - https://movie.naver.com/
  - https://movie.daum.net/main/new#slide-1-0
  - https://play.watcha.net/
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const recommend_movies_1 = require("./src/recommend-movies");
const chalk_1 = __importDefault(require("chalk"));
const user = {
    favMovieType: 'horror',
    level: 6,
    favMovieDateYears: Array.from({
        length: (2019 - 2000)
    }, (v, k) => k + 2000),
    favMovieCountry: 'japan'
};
(new recommend_movies_1.RecommendMovies).get(user).subscribe((movie) => {
    console.log(chalk_1.default.red.bold(`${movie.name}`));
    console.log(chalk_1.default.bold(`평정: ${movie.rating}`));
    console.log(chalk_1.default.bold(`제작일: ${movie.released.toLocaleString().slice(0, 10).replace(/-/g, "").split('/').pop()}`));
    console.log('\n');
});
