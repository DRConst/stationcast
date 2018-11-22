import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PlayerService } from "../player.service";
import {Episode} from '../episode'
import * as $ from 'jquery';

@Component({
  selector: 'app-playlist-view',
  templateUrl: './playlist-view.component.html',
  styleUrls: ['./playlist-view.component.css']
})



export class PlaylistViewComponent implements OnInit {


  playlist : Episode[];
  currentIndex: number;

  constructor(private playerService: PlayerService, private cd: ChangeDetectorRef) { }

  onEpisodeDelete(data)
  {
    this.playlist.forEach(ep =>
    {
      if(ep.name == data)
      {
        this.playerService.dequeueEpisode.next(ep);
      }
    });
  }


  ngOnInit() {
    document.getElementById('contents');
    this.currentIndex = 0;
    this.playlist = new Array();
    this.playerService.enqueueEpisode.subscribe(episode => {
      if(episode && episode.name){
        this.playlist.push(episode);
      }
    });

    this.playerService.dequeueEpisode.subscribe(episode => {
      this.playlist.splice( this.playlist.indexOf(episode), 1 );
    });

    this.playerService.endEpisode.subscribe(episode => {
      this.currentIndex = this.currentIndex + 1;

      if(this.currentIndex > this.playlist.length - 1)
        this.currentIndex = 0;

      this.playerService.currentEpisode.next(this.playlist[this.currentIndex]);

    });

    this.playerService.nextEpisode.subscribe(e => {
      this.currentIndex = this.currentIndex + 1;

      if(this.currentIndex > this.playlist.length - 1)
        this.currentIndex = 0;

      this.playerService.currentEpisode.next(this.playlist[this.currentIndex]);
    });

    this.playerService.prevEpisode.subscribe(e => {
      this.currentIndex = this.currentIndex - 1;

      if(this.currentIndex < 0)
        this.currentIndex = this.playlist.length - 1;

      this.playerService.currentEpisode.next(this.playlist[this.currentIndex]);
    });
  }

}
