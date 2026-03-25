import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../shared/components/event-card/event-card';
import { EventService } from '../../core/services/event.service';
import { HeaderComponent } from '../../layout/components/header/header';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

  companions = [
    { label: '👤 Solo',      value: 'solo' },
    { label: '❤️ En pareja', value: 'pareja' },
    { label: '👥 En grupo',  value: 'grupo' },
    { label: '👨‍👩‍👧 Familia',  value: 'familia' },
  ];

  vibes = [
    { label: '😌 Algo tranquilo',     value: 'tranquilo' },
    { label: '⚡ Algo emocionante',   value: 'emocionante' },
    { label: '🌿 Al aire libre',      value: 'exterior' },
    { label: '🏛️ Bajo techo',         value: 'interior' },
    { label: '🍽️ Con buena comida',   value: 'gastronomico' },
    { label: '🎨 Algo cultural',      value: 'cultural' },
  ];

  selectedCompanion: any = null;
  selectedVibe: any = null;
  response: string = '';
  advisorLoading = false;

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private eventService: EventService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.eventService.getEvents(1, 12).subscribe({
        next: (res) => {
          this.events = res.data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = true;
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  selectCompanion(option: any) {
    this.selectedCompanion = option;
    this.selectedVibe = null;
    this.response = '';
  }

  selectVibe(option: any) {
    this.selectedVibe = option;
    this.fetchRecommendation(this.selectedCompanion.value, option.value);
  }

  fetchRecommendation(companion: string, vibe: string) {
    this.advisorLoading = true;
    this.response = '';
    this.http.post<any>('http://localhost:3000/api/recommend', { companion, vibe })
      .subscribe({
        next: (res) => {
          this.response = res.events;
          this.advisorLoading = false;
          // Usar el html para mostrar las recomendaciones como tengo en el home


          this.cdr.detectChanges();
        },
        error: () => {
          this.response = 'Error generando recomendación 😔';
          this.advisorLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  goToActivity() {
    console.log('Ir a actividad');
  }
}