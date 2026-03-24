import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../shared/components/event-card/event-card';
import { EventService } from '../../core/services/event.service';
import { HeaderComponent } from '../../layout/components/header/header';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, EventCardComponent, HeaderComponent, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  events: any[] = [];
  loading = true;
  error = false;

  options = [
  { label: 'Una que hacer solo', value: 'solo' },
  { label: 'Una que hacer en pareja', value: 'pareja' },
  { label: 'Una que hacer en grupo', value: 'grupo' }
];

  selectedOption: any = null;
  response: string = '';

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  constructor(private eventService: EventService,
              private http: HttpClient  
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.eventService.getEvents(1, 12).subscribe({
        next: (res) => {
          this.events = res.data;
          this.loading = false;
          this.cdr.detectChanges(); // ← fuerza actualización de la vista
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  selectOption(option: any) {
  this.selectedOption = option;
  this.fetchRecommendation(option.value);
}

  fetchRecommendation(type: string) {
    this.http.post<any>('http://localhost:3000/api/recommend', { type })
      .subscribe({
        next: (res) => {
          this.response = res.message;
          this.cdr.detectChanges(); // importante en tu caso (SSR)
        },
        error: () => {
          this.response = 'Error generando recomendación';
          this.cdr.detectChanges();
        }
      });
  }

  goToActivity() {
    console.log('Ir a actividad');
  }

}