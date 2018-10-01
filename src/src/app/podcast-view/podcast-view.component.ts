import { Component, OnInit } from '@angular/core';
import { Podcast } from '../podcast'
import { Episode } from '../episode'
import { ActivatedRoute } from '@angular/router';
import { PlayerService } from "../player.service";

import * as $ from 'jquery';

@Component({
  selector: 'app-podcast-view',
  templateUrl: './podcast-view.component.html',
  styleUrls: ['./podcast-view.component.css']
})
export class PodcastViewComponent implements OnInit {

  constructor(private route: ActivatedRoute, private playerService: PlayerService) { }
  private sub: any;
  podcastName: string;


  podcast: Podcast;
  currentEpisode: Episode;
  selectedEpisode: Episode;



  headerPlay()
  {
    //Add all not completed episodes to the playlist

    this.podcast.episodes.forEach(ep =>
    {
      if(!ep.completed)
      {
        this.playerService.enqueueEpisode.next(ep);
      }
    });
  }

  
  headerDelete()
  {

  }
  headerUpdate()
  {

  }
  headerHome()
  {

  }

  onEpisodePlay( data ){
    this.playerService.setCurrentPodcast(this.podcast);
    this.podcast.episodes.forEach(ep =>
    {
      if(ep.name == data)
      {
        this.playerService.setCurrentEpisode(ep);
      }
    });

  }

  onEpisodeQueue( data ){
    this.playerService.setCurrentPodcast(this.podcast);
    this.podcast.episodes.forEach(ep =>
    {
      if(ep.name == data)
      {
        this.playerService.enqueueEpisode.next(ep);
      }
    });

  }

  resetProgress()
  {
      this.playerService.resetEpisodeProgress(this.selectedEpisode);
      this.selectedEpisode.completed = false;
      $.ajax({
        url:"https://audioback.diogoconstancio.com/updatePosition",
        type:"POST",
        data:"{\"name\" : \"" + this.podcast.name + '|' + this.selectedEpisode.name + "\", \"elapsed\" : 0.0}",
        contentType:"application/json; charset=utf-8"
      });
  }

  toggleCompleted(episode)
  {
      this.selectedEpisode = episode;
      $.ajax({
        url:"https://audioback.diogoconstancio.com/episodeCompletedStatus",
        type:"POST",
        contentType:"application/json; charset=utf-8",
        data:"{\"name\" : \"" + this.podcast.name + '|' + episode.name + "\", \"completed\" : " + !episode.completed + "}",
        success: () =>
        {
            episode.completed = !episode.completed;
        }
      })
  }
  onTooltipHover(event)
  {
    var root = event.path[0];
    var tooltip = root.getElementsByClassName("tooltiptext")
    if(event.screenY + tooltip[0].offsetHeight > $(window).height()){
        tooltip[0].style.top = "" + -tooltip[0].offsetHeight + "px";
    }else{
        tooltip[0].style.top = "auto";
    }
  }


  parsePodcast( data )
  {
    var info = JSON.parse(data);
    var podcastInfo = info.podcast;



    //this.podcast.episodes = EPISODES;
    this.podcast.id = 0;
    this.podcast.name = podcastInfo.name;
    this.podcast.url = podcastInfo.url;
    this.podcast.thumb = podcastInfo.thumb;
    this.podcast.homepage = podcastInfo.homepage;
    this.podcast.desc = podcastInfo.desc;

    var episodeArray = info.episodes;

    episodeArray.forEach(ep => {
        var episode = new Episode();
        episode.name = ep.name;
        episode.url = ep.url;
        episode.date = ep.date;
        episode.desc = ep.desc;
        episode.elapsed = ep.elapsed;
        episode.completed = ep.completed;
        episode.length = Math.ceil(ep.length);



        var desc = ep.desc.split(/<\/p>/g)[0];
        desc += "</p>";
        // episode.desc = ep.desc;//.replace(/<\/?p>/g, "");
        episode.shortDesc = desc;//.replace(/<\/?p>/g, "");

        this.podcast.episodes.push(episode);
      //console.log(ep);
    })

    var comparator = function(a, b)
    {
      if(a.date < b.date)
        return -1;
      else if(a.date == b.date)
        return 0;
      else
        return 1;
    }

    this.podcast.episodes.sort(comparator);


  }

  ngOnInit() {

      this.sub = this.route.params.subscribe(params => {
        this.podcastName = params['name'];
      });

      this.playerService.currentEpisode.subscribe(episode =>
      {
          //console.log(podcast);
          this.currentEpisode = episode;
      });

      this.podcast = new Podcast();
      this.podcast.name = "Loading...";
      this.podcast.episodes = [];


      $.ajax({
        url:"https://audioback.diogoconstancio.com/podcastInfo?name=" + this.podcastName,
        type:"GET",
        success: data =>
        {
          this.parsePodcast(data);
        }
      })
  }

}
