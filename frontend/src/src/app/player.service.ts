import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Podcast } from './podcast';
import { Episode } from './episode';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private podcastSource = new BehaviorSubject(new Podcast());
  currentPodcast = this.podcastSource;

  private episodeSource = new BehaviorSubject(new Episode());
  currentEpisode = this.episodeSource;

  private resetEpisodeRefSource = new BehaviorSubject(new Episode());
  resetEpisodeRef = this.resetEpisodeRefSource;
  //currentEpisode = this.episodeSource.asObservable();

  private enqueueEpisodeSource = new BehaviorSubject(new Episode());
  enqueueEpisode = this.enqueueEpisodeSource;

  private dequeueEpisodeSource = new BehaviorSubject(new Episode());
  dequeueEpisode = this.dequeueEpisodeSource;

  private endEpisodeSource = new BehaviorSubject(-1);
  endEpisode = this.endEpisodeSource;

  private nextEpisodeSource = new BehaviorSubject(-1);
  nextEpisode = this.nextEpisodeSource;

  private prevEpisodeSource = new BehaviorSubject(-1);
  prevEpisode = this.prevEpisodeSource;

  constructor() { }

  setCurrentPodcast(podcast: Podcast) {
    this.currentPodcast.next(podcast)
  }

  setCurrentEpisode(episode: Episode) {
    this.currentEpisode.next(episode)
  }

  resetEpisodeProgress(episode: Episode)
  {
      this.resetEpisodeRef.next(episode);
  }

}
