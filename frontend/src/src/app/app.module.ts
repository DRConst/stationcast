import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { PodcastViewComponent } from './podcast-view/podcast-view.component';
import { PodcastDownloaderComponent } from './podcast-downloader/podcast-downloader.component';
import { PodcastListComponent } from './podcast-list/podcast-list.component';
import { AppRoutingModule } from './/app-routing.module';
import { PlayerFooterComponent } from './player-footer/player-footer.component';
import { PlaylistViewComponent } from './playlist-view/playlist-view.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    PodcastViewComponent,
    PodcastDownloaderComponent,
    PodcastListComponent,
    PlayerFooterComponent,
    PlaylistViewComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
