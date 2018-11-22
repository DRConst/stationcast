import { Component, OnInit } from '@angular/core';
import { Podcast } from '../podcast';
import { Router } from '@angular/router';

import * as $ from 'jquery';

@Component({
  selector: 'app-podcast-list',
  templateUrl: './podcast-list.component.html',
  styleUrls: ['./podcast-list.component.css']
})
export class PodcastListComponent implements OnInit {

  constructor(private router: Router) { }

  podcasts: Podcast[];

  onCardClick(podcast)
  {
    this.router.navigate(['/detail/'+podcast.name]);
  }

  parsePodcast(data) {
    var json = JSON.parse(data);
    json.podcasts.forEach(podcastJSON => {
      var podcast = new Podcast();

      podcast.name = podcastJSON.name,
      podcast.url = podcastJSON.url,
      podcast.homepage = podcastJSON.homepage,
      podcast.desc = podcastJSON.desc,
      podcast.thumb = podcastJSON.thumb

      this.podcasts.push(podcast);
    });

  }

  ngOnInit() {
    this.podcasts = new Array();

    $.ajax({
      url:"https://audioback.diogoconstancio.com/listPodcasts",
      type:"GET",
      success: data =>
      {
        this.parsePodcast(data);
      }
    })
  }

}
