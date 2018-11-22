import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './bootstrap.css']
})
export class AppComponent {
  title = 'audiobooks';

  ngOnInit(){
    if (localStorage.tempScrollTop) {
      $(window).scrollTop(localStorage.tempScrollTop);
    }

    $(window).on('unload', function(event) {
      localStorage.tempScrollTop = $(window).scrollTop();
    });
  }
}
