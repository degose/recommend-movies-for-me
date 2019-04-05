"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("rxjs/index");
const axios_1 = __importDefault(require("axios"));
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
    exampleGetContents() {
        return index_1.forkJoin(this.suggestionPlatformEndPoints.map((suggestionPlatformEndPoint) => {
            return axios_1.default.get(suggestionPlatformEndPoint);
        }));
    }
}
exports.RecommendMovies = RecommendMovies;
