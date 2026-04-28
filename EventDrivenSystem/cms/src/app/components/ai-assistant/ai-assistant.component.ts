import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { AiMarkdownPipe } from '../../pipes/ai-markdown.pipe';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestedTopic {
  icon: string;
  label: string;
  questions: string[];
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, AiMarkdownPipe],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.css']
})
export class AiAssistantComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  userInput = '';
  loading = false;
  history: ChatMsg[] = [];
  copiedIndex: number | null = null;

  readonly topics: SuggestedTopic[] = [
    {
      icon: '🍛',
      label: 'Menu & Food',
      questions: [
        'What are your most popular dishes?',
        'What vegetarian options do you have?',
        'Recommend a dish for a first-time visitor',
        'What\'s the price range of your menu?'
      ]
    },
    {
      icon: '🏠',
      label: 'Restaurants',
      questions: [
        'What restaurants are available?',
        'Which restaurant has the best biryani?',
        'Which restaurants have rooftop dining?',
        'Tell me about your AC rooms'
      ]
    },
    {
      icon: '📅',
      label: 'Reservations',
      questions: [
        'How do I book a table?',
        'Can I make a group reservation?',
        'How many guests can a table accommodate?',
        'What is your cancellation policy?'
      ]
    },
    {
      icon: '🌾',
      label: 'Bangladeshi Cuisine',
      questions: [
        'What is hilsa fish curry?',
        'Explain the different types of biriyani',
        'What are traditional Bangladeshi desserts?',
        'What makes Deshi food unique?'
      ]
    }
  ];

  activeTopic: SuggestedTopic | null = null;

  constructor(private restaurantService: RestaurantService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  get hasMessages() {
    return this.history.length > 0;
  }

  selectTopic(topic: SuggestedTopic) {
    this.activeTopic = this.activeTopic === topic ? null : topic;
  }

  ask(question: string) {
    this.activeTopic = null;
    this.userInput = question;
    this.send();
  }

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) return;

    this.history.push({ role: 'user', content: text, timestamp: new Date() });
    this.userInput = '';
    this.loading = true;

    const messages = this.history.map(m => ({ role: m.role, content: m.content }));

    this.restaurantService.chat(messages).subscribe({
      next: ({ reply }) => {
        this.history.push({ role: 'assistant', content: reply, timestamp: new Date() });
        this.loading = false;
      },
      error: (err) => {
        console.error('AI chat error:', err);
        const msg = err?.error?.error ?? 'Sorry, I\'m having trouble connecting right now. Please try again in a moment!';
        this.history.push({ role: 'assistant', content: msg, timestamp: new Date() });
        this.loading = false;
      }
    });
  }

  clearChat() {
    this.history = [];
    this.activeTopic = null;
  }

  copyMessage(content: string, index: number) {
    navigator.clipboard.writeText(content).then(() => {
      this.copiedIndex = index;
      setTimeout(() => (this.copiedIndex = null), 1500);
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }
}
