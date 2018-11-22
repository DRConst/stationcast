import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PodcastViewComponent } from './podcast-view.component';

describe('PodcastViewComponent', () => {
  let component: PodcastViewComponent;
  let fixture: ComponentFixture<PodcastViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PodcastViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PodcastViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
