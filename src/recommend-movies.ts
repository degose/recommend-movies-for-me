import {forkJoin, from, Observable, of} from "rxjs";
import axios, {AxiosPromise, AxiosResponse} from 'axios';
import {
  bufferTime,
  catchError,
  concatAll, concatMap, debounceTime, delay, filter, first, map, mergeAll, mergeMap, pluck, switchAll,
  tap, zip
} from "rxjs/internal/operators";
import cheerio from 'cheerio';
import iconv from 'iconv-lite';
import qs from 'qs';
import driver, {IWebDriverOptionsCookie, WebElement} from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import chromedriver from 'chromedriver';
import {MovieInterface} from './interfaces/movie.interface';
import {DaumMovieResponseInterface} from './interfaces/daum-movie-response.interface';
import {UserInterface} from './interfaces/user.interface';

export enum SuggestionPlatformEndPoint {
  NaverMovie = 'https://movie.naver.com/',
  DaumMovie = 'https://search.daum.net/qsearch',
}

export class RecommendMovies {
  private suggestionPlatformEndPoints: string[] = [
    SuggestionPlatformEndPoint.NaverMovie,
    SuggestionPlatformEndPoint.DaumMovie,
  ];

  public constructor() {
    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
  }

  public getContentsFromNaverMovie(movieYear: number, favMovieCountry: string, favMovieType: string): Observable<MovieInterface[]> {
    return from(axios.get(`${SuggestionPlatformEndPoint.NaverMovie}/movie/sdb/browsing/bmovie.nhn`, {
      responseType: 'arraybuffer',
      params: {
        year: movieYear,
        genre: favMovieType === 'horror' ? '4' : '',
        nation: favMovieCountry === 'japan' ? 'JP' : ''
      }
    })).pipe(
      map((response: AxiosResponse) => cheerio.load(iconv.decode(response.data, 'EUC-KR').toString())),
      map(($: CheerioStatic) => $('#old_content').find('> ul > li')),
      map((movieNodes: Cheerio) => movieNodes.toArray()),
      delay(300),
      concatMap((movieNodes: CheerioElement[]) => forkJoin(
        movieNodes.map((movieNode) => {
          const detailId: number = qs.parse(cheerio.load(movieNode)('li:nth-child(1)').find('> a').attr('href').split('?')[1]).code;
          return this.getDetailContentsFromNaverMovie(detailId);
        })
      )),
    )
  }

  private getDaumMovieTrans(): Observable<{
    mk: string,
    uk: string,
    cookies: IWebDriverOptionsCookie[]
  }> {
    const lookUpEndPoint: string = 'https://search.daum.net/search?w=tot&';
    const chromeClient = new driver.Builder()
      .withCapabilities(driver.Capabilities.chrome())
      .setChromeOptions(new chrome.Options().headless().windowSize({
        width: 1,
        height: 1
      }))
      .build();

    return from(chromeClient.get(lookUpEndPoint)).pipe(
      concatMap(() => forkJoin([
        chromeClient.executeScript('return mk') as Promise<string>,
        chromeClient.executeScript('return uk') as Promise<string>,
        chromeClient.manage().getCookies()
      ])),
      concatMap((trans: [string, string, IWebDriverOptionsCookie[]]) => {
        return from(chromeClient.quit()).pipe(
          map(() => {
            return {
              mk: trans[0],
              uk: trans[1],
              cookies: trans[2]
            }
          })
        );
      })
    )
  }

  public getContentsFromDaumMovie(movieYear: number, favMovieCountry: string, favMovieType: string): Observable<MovieInterface[]> {
    return this.getDaumMovieTrans().pipe(
      delay(300),
      concatMap((trans) => {
        return axios.get(SuggestionPlatformEndPoint.DaumMovie, {
          params: {
            qsearch_ver: 'v2',
            viewtype: 'json',
            w: 'smartanswer',
            mk: trans.mk,
            uk: trans.uk,
            type: 'MOV',
            sort: 0,
            sidx: 0,
            lpp: 100,
            '1605_2': favMovieCountry === 'japan' ? 'JP' : '',
            '2004_1': movieYear,
            '1604_1': 11
          },
          withCredentials: true,
          headers: {
            Cookie: `'${trans.cookies.map(cookie => `${cookie.name}=${cookie.value}; `).join('')}'`,
          },
        })
      }),
      filter((response: AxiosResponse) => response.data.RESULT.SMARTANSWER.root.result && response.data.RESULT.SMARTANSWER.root.result.items && response.data.RESULT.SMARTANSWER.root.result.items.length > 0),
      map((response: AxiosResponse) => response.data.RESULT.SMARTANSWER.root.result.items.map((item: DaumMovieResponseInterface) => {
        return {
          name: item.KEY_TITLE_MOBILE['#text' as any] as any,
          released: new Date(movieYear),
          detailId: 33,
          rating: 9,
          from: SuggestionPlatformEndPoint.DaumMovie
        } as MovieInterface
      })),
    );
  }

  public getDetailContentsFromNaverMovie(detailId: number): Observable<MovieInterface> {
    return from(axios.get(`${SuggestionPlatformEndPoint.NaverMovie}/movie/bi/mi/basic.nhn?code=${detailId}`)).pipe(
      debounceTime(500),
      map((response: AxiosResponse) => cheerio.load(response.data)),
      map(($: CheerioStatic) => {
        return {
          name: $('#content').find(' > div > div.mv_info_area > div.mv_info > h3 > a').text(),
          released: new Date($('#content').find(' > div > div.mv_info_area > div.mv_info > strong').text().split(',').filter((x) => !isNaN(Number(x)))[0]),
          from: SuggestionPlatformEndPoint.NaverMovie,
          rating: Number($('#content').find('#pointNetizenPersentBasic > em').text()),
          detailId
        } as MovieInterface;
      }),
    )

  }

  public get(user: UserInterface): Observable<MovieInterface> {
    return forkJoin(user.favMovieDateYears.map((year) => {
      return [
        this.getContentsFromNaverMovie(year, user.favMovieCountry, user.favMovieType),
        this.getContentsFromDaumMovie(year, user.favMovieCountry, user.favMovieType)
      ]
    })).pipe(
      mergeAll(),
      concatAll(),
      concatAll(),
      filter((movie: MovieInterface) => movie.rating > user.level)
    )
  }
}