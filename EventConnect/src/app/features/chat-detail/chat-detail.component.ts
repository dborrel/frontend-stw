import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewChecked
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../layout/components/header/header';

@Component({
  standalone: true,
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrl: './chat-detail.component.scss',
  imports: [CommonModule, FormsModule, HeaderComponent]
})
export class ChatDetailComponent implements OnInit, AfterViewChecked {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private location = inject(Location);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  conversationId = '';
  conversation: any = null;
  messages: any[] = [];
  newMessage = '';
  currentUserId = '';

  isLoading = false;
  shouldScrollToBottom = false;

  ngOnInit(): void {
    this.conversationId = this.route.snapshot.paramMap.get('conversationId') || '';

    // Intentar obtener el usuario del caché primero
    const cached = this.authService.getCurrentUser();
    if (cached?._id) {
      this.currentUserId = cached._id;
      if (this.conversationId) {
        this.loadMessages();
        this.markAsRead();
      }
    } else {
      // Si no está en caché, pedirlo al backend y luego cargar mensajes
      this.authService.getProfile().pipe(
        finalize(() => this.cdr.detectChanges())
      ).subscribe({
        next: (user) => {
          this.currentUserId = user?._id ?? user?.id ?? '';
          if (this.conversationId) {
            this.loadMessages();
            this.markAsRead();
          }
        },
        error: () => {
          // Sin perfil: cargar mensajes igualmente (no se marcarán como propios)
          if (this.conversationId) {
            this.loadMessages();
          }
        }
      });
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  goBack(): void {
    this.location.back();
  }

  loadMessages(): void {
    this.isLoading = true;

    this.chatService.getConversationMessages(this.conversationId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.conversation = res.conversation;
          this.messages = res.messages || [];
          this.shouldScrollToBottom = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar mensajes:', err);
        }
      });
  }

  sendMessage(): void {
    const content = this.newMessage.trim();
    if (!content) return;

    this.newMessage = '';

    // Insertar optimistamente para que aparezca al instante
    const optimisticMsg = {
      _id: `temp_${Date.now()}`,
      content,
      sender: this.currentUserId,
      createdAt: new Date().toISOString(),
      _optimistic: true
    };
    this.messages = [...this.messages, optimisticMsg];
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();

    this.chatService.sendMessage(this.conversationId, content).subscribe({
      next: (res) => {
        if (res?.chatMessage) {
          this.messages = this.messages.map(m =>
            m._id === optimisticMsg._id ? res.chatMessage : m
          );
          this.shouldScrollToBottom = true;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        this.messages = this.messages.filter(m => m._id !== optimisticMsg._id);
        this.newMessage = content;
        this.cdr.detectChanges();
      }
    });
  }

  markAsRead(): void {
    this.chatService.markConversationAsRead(this.conversationId).subscribe({
      error: (err) => console.error('Error al marcar como leído:', err)
    });
  }

  isOwnMessage(msg: any): boolean {
    if (!this.currentUserId) return false;
    const senderId = msg?.sender?._id ?? msg?.sender?.id ?? msg?.sender;
    return senderId === this.currentUserId;
  }

  getMessageTime(dateValue: string): string {
    if (!dateValue) return '';
    return new Date(dateValue).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    if (!this.messagesContainer) return;
    const el = this.messagesContainer.nativeElement;
    el.scrollTop = el.scrollHeight;
  }
}