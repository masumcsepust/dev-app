import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { AiMarkdownPipe } from '../../pipes/ai-markdown.pipe';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What restaurants are available?',
  'Recommend a dish for me',
  'What vegetarian options do you have?',
  'How do I book a table?',
];

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AiMarkdownPipe],
  templateUrl: './ai-chat.component.html',
  styleUrls: ['./ai-chat.component.css']
})
export class AiChatComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  isOpen = false;
  loading = false;
  userInput = '';
  unread = 0;
  history: ChatMsg[] = [
    { role: 'assistant', content: 'Hi! I\'m your DeshiFood AI assistant 🍛 Ask me anything about our menu, restaurants, or help finding the perfect dish!' }
  ];

  readonly suggestions = SUGGESTIONS;

  constructor(private restaurantService: RestaurantService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.unread = 0;
  }

  ask(question: string) {
    this.userInput = question;
    this.send();
  }

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) return;

    this.history.push({ role: 'user', content: text });
    this.userInput = '';
    this.loading = true;

    this.restaurantService.chat(this.history).subscribe({
      next: ({ reply }) => {
        this.history.push({ role: 'assistant', content: reply });
        this.loading = false;
        if (!this.isOpen) this.unread++;
      },
      error: (err) => {
        console.error('AI chat error:', err);
        const msg = err?.error?.error ?? 'Sorry, I\'m having trouble connecting right now. Please try again!';
        this.history.push({ role: 'assistant', content: msg });
        this.loading = false;
        if (!this.isOpen) this.unread++;
      }
    });
  }

  clearChat() {
    this.history = [this.history[0]];
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  get showSuggestions() {
    return this.history.length === 1 && !this.loading;
  }

  private scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }
}
