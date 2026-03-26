import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { HeaderComponent } from '../../layout/components/header/header';
import { StripHtmlPipe } from '../../shared/pipes/strip-html.pipe';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, StripHtmlPipe],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  event: any = null;
  loading = true;
  error = false;
  isAttending = false; 

  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.eventService.getEventById(id).subscribe({
          next: (res) => {
            this.event = res.data;
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
  }

  onAttendClick() {
    if (!this.event || !this.event._id) return;

    this.eventService.toggleAttend(this.event._id).subscribe({
      next: (res) => {
        this.isAttending = res.isAttending; 
        this.cdr.detectChanges();
        alert(res.message); 
      },
      error: (err) => {
        console.error('Error al apuntarse al evento:', err);
        if (err.status === 401) {
          alert('Tienes que iniciar sesión para apuntarte.');
        } else {
          alert('Hubo un problema al apuntarte. Inténtalo de nuevo.');
        }
      }
    });
  }
}