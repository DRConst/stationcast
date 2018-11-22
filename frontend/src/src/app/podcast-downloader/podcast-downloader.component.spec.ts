import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastDownloaderComponent } from './podcast-downloader.component';

describe('PodcastDownloaderComponent', () => {
  let component: PodcastDownloaderComponent;
  let fixture: ComponentFixture<PodcastDownloaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PodcastDownloaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PodcastDownloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
