"use strict";
/*
  Recommend movies for me

  Suggestion platform
  - https://movie.naver.com/
  - https://movie.daum.net/main/new#slide-1-0
  - https://play.watcha.net/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const recommend_movies_1 = require("./src/recommend-movies");
(new recommend_movies_1.RecommendMovies).exampleGetContents().subscribe((contents) => {
    console.log('contents', contents);
});
