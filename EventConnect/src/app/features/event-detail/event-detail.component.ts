import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { HeaderComponent } from '../../layout/components/header/header';
import { StripHtmlPipe } from '../../shared/pipes/strip-html.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, StripHtmlPipe, FormsModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  event: any = null;
  loading = true;
  error = false;
  activeTab: 'chat' | 'amigos' = 'chat';

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.eventService.getEventById(id).subscribe({
          next: async (res) => {
            this.event = res.data;
            this.loading = false;
            this.cdr.detectChanges();
            if (this.event.latitude && this.event.longitude) {
              await this.initMiniMap();
            }
          },
          error: () => {
            this.error = true;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  async initMiniMap() {
    const L = await import('leaflet');
    setTimeout(() => {
      const map = L.map('mini-map', {
        center: [this.event.latitude, this.event.longitude],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([this.event.latitude, this.event.longitude]).addTo(map);
    }, 100);
  }
}