import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isDarkMode: boolean = false;

  constructor(private renderer: Renderer2) {
  }

  onDarkModeChange(isDarkMode: boolean) {
    this.isDarkMode = isDarkMode;
    this.renderer.setAttribute(
      document.documentElement,
      'data-theme',
      this.isDarkMode ? 'dark' : 'cupcake'
    );
  }
}
