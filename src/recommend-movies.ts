import {forkJoin, from, Observable, of} from "rxjs";
import axios, {AxiosPromise, AxiosResponse} from 'axios';
import {
  concatAll, concatMap, debounceTime, filter, first, map, mergeAll, mergeMap, switchAll,
  tap
} from "rxjs/internal/operators";
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import qs from 'qs';

enum SuggestionPlatform {
  NaverMovie = 'https://movie.naver.com/',
  DaumMovie = 'https://movie.daum.net/',
  Watch = 'https://play.watcha.net/',
}

export interface Movie {
  readonly name: string;
  readonly released: Date;
  readonly detailId: number;
  readonly rating: number;
  readonly from: SuggestionPlatform
}

export interface User {
  readonly favMovieType: string;
  readonly level: number;
  readonly favMovieDateYears: number[];
  readonly favMovieCountry: string;
}

export class RecommendMovies {
  private suggestionPlatformEndPoints: string[] = [
    SuggestionPlatform.NaverMovie,
    SuggestionPlatform.DaumMovie,
    SuggestionPlatform.Watch,
  ];

  public getContentsFromNaverMovie(movieYear: number, favMovieCountry: string, favMovieType: string): Observable<Movie[]> {
    return from(axios.get(`${SuggestionPlatform.NaverMovie}/movie/sdb/browsing/bmovie.nhn?year=${movieYear}&genre=${favMovieType === 'horror' ? '4' : ''}&nation=${favMovieCountry === 'japan' ? 'JP' : ''}`, {
      responseType: 'arraybuffer'
    })).pipe(
      map((response: AxiosResponse) => cheerio.load(iconv.decode(response.data, 'EUC-KR').toString())),
      map(($: CheerioStatic) => $('#old_content').find('> ul > li')),
      map((movieNodes: Cheerio) => movieNodes.toArray()),
      debounceTime(1000),
      concatMap((movieNodes: CheerioElement[]) => forkJoin(
        movieNodes.map((movieNode) => {
          const detailId: number = qs.parse(cheerio.load(movieNode)('li:nth-child(1)').find('> a').attr('href').split('?')[1]).code;
          return this.getDetailContentsFromNaverMovie(detailId);
        })
      )),
    )
  }

  public getDetailContentsFromNaverMovie(detailId: number): Observable<Movie> {
    return from(axios.get(`${SuggestionPlatform.NaverMovie}/movie/bi/mi/basic.nhn?code=${detailId}`)).pipe(
      debounceTime(500),
      map((response: AxiosResponse) => cheerio.load(response.data)),
      map(($: CheerioStatic) => {
        return {
          name: $('#content').find(' > div > div.mv_info_area > div.mv_info > h3 > a').text(),
          released: new Date($('#content').find(' > div > div.mv_info_area > div.mv_info > strong').text().split(',').filter((x) => !isNaN(Number(x)))[0]),
          from: SuggestionPlatform.NaverMovie,
          rating: Number($('#content').find('#pointNetizenPersentBasic > em').text()),
          detailId
        } as Movie;
      }),
    )

  }

  public get(user: User): Observable<any> {
    return forkJoin(user.favMovieDateYears.map((year) => {
      return this.getContentsFromNaverMovie(year, user.favMovieCountry, user.favMovieType);
    })).pipe(
      mergeAll(),
      concatAll(),
      filter((movie: Movie) => movie.rating > user.level)
    )
  }
}