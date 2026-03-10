import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header';
import { EventCardComponent } from '../../shared/components/event-card/event-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, EventCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {}