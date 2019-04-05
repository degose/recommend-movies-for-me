/*
  Recommend movies for me

  Suggestion platform
  - https://movie.naver.com/
  - https://movie.daum.net/main/new#slide-1-0
  - https://play.watcha.net/
 */

import {RecommendMovies} from "./src/recommend-movies";

(new RecommendMovies).exampleGetContents().subscribe((contents) => {
  console.log('contents', contents);
});

