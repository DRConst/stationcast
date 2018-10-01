import { Component, OnInit } from '@angular/core';
import { Podcast } from '../podcast';
import * as $ from 'jquery';

@Component({
  selector: 'app-podcast-downloader',
  templateUrl: './podcast-downloader.component.html',
  styleUrls: ['./podcast-downloader.component.css']
})
export class PodcastDownloaderComponent implements OnInit {

  podcast: Podcast;

  constructor() { }

  ngOnInit() {
  }

  //http://feeds.nightvalepresents.com/welcometonightvalepodcast

  downloadPodcast()
  {
    var final = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(this.podcast.url) + '&api_key=fvt3wllh3t88lroahrjtbkwlkq50nueaz7cfs0u0&count=1000';
    // this.http.post('https://audioback.diogoconstancio.com/downloadPodcast', "{\"url\" : \"" + json + "\"}");
    //$.post( "https://audioback.diogoconstancio.com/downloadPodcast", "{\"url\" : \"" + json + "\"}");

    $.ajax({
      url:"https://audioback.diogoconstancio.com/downloadPodcast",
      type:"POST",
      data:"{\"url\" : \"" + final + "\"}",
      contentType:"application/json; charset=utf-8",
      dataType:"json"
    })
  }

  onRSSDownload(){

    var textBox = (<HTMLInputElement>document.getElementById('url'));
    this.podcast = new Podcast();
    this.podcast.url = textBox.value;
    this.downloadPodcast();
  }

}
