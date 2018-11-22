import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  navList()
  {
    this.router.navigate(['/list']);
  }

  navDownload()
  {
    this.router.navigate(['/downloader']);
  }

}
