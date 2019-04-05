import {forkJoin, Observable} from "rxjs/index";
import axios, {AxiosResponse} from 'axios';

enum SuggestionPlatform {
  NaverMovie = 'https://movie.naver.com/',
  DaumMovie = 'https://movie.daum.net/',
  Watch = 'https://play.watcha.net/',
}
export class RecommendMovies {
  private suggestionPlatformEndPoints: string[] = [
    SuggestionPlatform.NaverMovie,
    SuggestionPlatform.DaumMovie,
    SuggestionPlatform.Watch,

  ];

  public exampleGetContents(): Observable<AxiosResponse[]>
  {
    return forkJoin(this.suggestionPlatformEndPoints.map((suggestionPlatformEndPoint: string) => {
      return axios.get(suggestionPlatformEndPoint);
    }));
  }
}