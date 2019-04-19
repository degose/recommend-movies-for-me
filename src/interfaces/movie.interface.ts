import {SuggestionPlatformEndPoint} from '../recommend-movies';

export interface MovieInterface {
  readonly name: string;
  readonly released: Date;
  readonly detailId?: number;
  readonly rating: number;
  readonly from: SuggestionPlatformEndPoint
}