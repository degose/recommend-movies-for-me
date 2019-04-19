export interface DaumMovieResponseInterface {
  KEY_TITLE_MOBILE: DaumMovieResponseItemKeyValue[];
  KEY_INSPECT_POINT_AVG: DaumMovieResponseItemKeyValue[];
  KEY_RELEASE_DATE: DaumMovieResponseItemKeyValue[];
}

interface DaumMovieResponseItemKeyValue {
  '@key': string,
  '#text': string
}