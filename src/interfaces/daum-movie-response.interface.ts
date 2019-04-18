export interface DaumMovieResponseInterface {
  KEY_TITLE_MOBILE: DaumMovieResponseItemKeyTime[]
}
interface DaumMovieResponseItemKeyTime {
  '@key': string,
  '#text': string
}