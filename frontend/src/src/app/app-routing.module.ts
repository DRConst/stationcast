import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PodcastListComponent } from './podcast-list/podcast-list.component'
import { PodcastViewComponent } from './podcast-view/podcast-view.component'
import { PodcastDownloaderComponent } from './podcast-downloader/podcast-downloader.component'

const routes: Routes = [
  { path: '', redirectTo: '/list', pathMatch: 'full' },
  { path: 'list', component: PodcastListComponent },
  { path: 'downloader', component: PodcastDownloaderComponent },
  { path: 'detail/:name', component: PodcastViewComponent }
  // { path: 'heroes', component: HeroesComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
