"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const axios_1 = __importDefault(require("axios"));
const operators_1 = require("rxjs/internal/operators");
const cheerio_1 = __importDefault(require("cheerio"));
const iconv_lite_1 = __importDefault(require("iconv-lite"));
const qs_1 = __importDefault(require("qs"));
var SuggestionPlatform;
(function (SuggestionPlatform) {
    SuggestionPlatform["NaverMovie"] = "https://movie.naver.com/";
    SuggestionPlatform["DaumMovie"] = "https://movie.daum.net/";
    SuggestionPlatform["Watch"] = "https://play.watcha.net/";
})(SuggestionPlatform || (SuggestionPlatform = {}));
class RecommendMovies {
    constructor() {
        this.suggestionPlatformEndPoints = [
            SuggestionPlatform.NaverMovie,
            SuggestionPlatform.DaumMovie,
            SuggestionPlatform.Watch,
        ];
    }
    getContentsFromNaverMovie(movieYear, favMovieCountry, favMovieType) {
        return rxjs_1.from(axios_1.default.get(`${SuggestionPlatform.NaverMovie}/movie/sdb/browsing/bmovie.nhn?year=${movieYear}&genre=${favMovieType === 'horror' ? '4' : ''}&nation=${favMovieCountry === 'japan' ? 'JP' : ''}`, {
            responseType: 'arraybuffer'
        })).pipe(operators_1.map((response) => cheerio_1.default.load(iconv_lite_1.default.decode(response.data, 'EUC-KR').toString())), operators_1.map(($) => $('#old_content').find('> ul > li')), operators_1.map((movieNodes) => movieNodes.toArray()), operators_1.debounceTime(1000), operators_1.concatMap((movieNodes) => rxjs_1.forkJoin(movieNodes.map((movieNode) => {
            const detailId = qs_1.default.parse(cheerio_1.default.load(movieNode)('li:nth-child(1)').find('> a').attr('href').split('?')[1]).code;
            return this.getDetailContentsFromNaverMovie(detailId);
        }))));
    }
    getDetailContentsFromNaverMovie(detailId) {
        return rxjs_1.from(axios_1.default.get(`${SuggestionPlatform.NaverMovie}/movie/bi/mi/basic.nhn?code=${detailId}`)).pipe(operators_1.debounceTime(500), operators_1.map((response) => cheerio_1.default.load(response.data)), operators_1.map(($) => {
            return {
                name: $('#content').find(' > div > div.mv_info_area > div.mv_info > h3 > a').text(),
                released: new Date($('#content').find(' > div > div.mv_info_area > div.mv_info > strong').text().split(',').filter((x) => !isNaN(Number(x)))[0]),
                from: SuggestionPlatform.NaverMovie,
                rating: Number($('#content').find('#pointNetizenPersentBasic > em').text()),
                detailId
            };
        }));
    }
    get(user) {
        return rxjs_1.forkJoin(user.favMovieDateYears.map((year) => {
            return this.getContentsFromNaverMovie(year, user.favMovieCountry, user.favMovieType);
        })).pipe(operators_1.mergeAll(), operators_1.concatAll(), operators_1.filter((movie) => movie.rating > user.level));
    }
}
exports.RecommendMovies = RecommendMovies;
