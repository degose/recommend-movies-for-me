"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const axios_1 = __importDefault(require("axios"));
const operators_1 = require("rxjs/internal/operators");
const iconv_1 = __importDefault(require("iconv"));
var SuggestionPlatform;
(function (SuggestionPlatform) {
    SuggestionPlatform["NaverMovie"] = "https://movie.naver.com/";
    SuggestionPlatform["DaumMovie"] = "https://movie.daum.net/";
    SuggestionPlatform["Watch"] = "https://play.watcha.net/";
})(SuggestionPlatform || (SuggestionPlatform = {}));
//2000 - 2002 년도 영화 중 네티즌 평점이 인간적으로 6점 넘는 일본 호러 영화로 추천해줘.
class RecommendMovies {
    constructor() {
        this.suggestionPlatformEndPoints = [
            SuggestionPlatform.NaverMovie,
            SuggestionPlatform.DaumMovie,
            SuggestionPlatform.Watch,
        ];
    }
    getContentsFromNaverMovie() {
        return rxjs_1.from(axios_1.default.get(`${SuggestionPlatform.NaverMovie}/movie/sdb/browsing/bmovie.nhn?year=2000&genre=4&nation=JP`, {
            headers: {
                'Content-Type': 'text/html;charset=utf-8',
                'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            }
        })).pipe(operators_1.map((response) => new iconv_1.default('EUC-KR', 'UTF-8').convert(new Buffer(response.data, 'utf-8')).toString()));
    }
    get() {
        return this.getContentsFromNaverMovie();
    }
}
exports.RecommendMovies = RecommendMovies;
