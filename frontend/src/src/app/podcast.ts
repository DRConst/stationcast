import {Episode} from './episode'

export class Podcast {
  id: number;
  name: string;
  url: string;
  homepage: string;
  desc: string;
  thumb: string;
  episodes: Episode[];
}
