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

interface TopicGroup {
  id: string;
  color: string;
  icon: string;
  label: string;
  questions: string[];
}

@Component({
  selector: 'app-cms-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, AiMarkdownPipe],
  template: `
    <div class="ai-page">
      <div class="ai-header">
        <div class="ai-header-left">
          <div class="ai-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2zM7.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
            </svg>
          </div>
          <div>
            <h1>CMS Admin Assistant</h1>
            <p>Ask anything about pharmacy, restaurant, or user management</p>
          </div>
        </div>
        <button *ngIf="history.length" class="clear-btn" (click)="clearChat()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
          New Chat
        </button>
      </div>

      <div class="chat-area">
        <div class="messages-wrap" #scrollAnchor>
          <!-- Empty state -->
          <div *ngIf="!history.length" class="empty-state">
            <p class="empty-hint">Choose a topic or ask anything about your platform</p>
            <div class="topic-groups">
              <div *ngFor="let group of topicGroups" class="topic-group" [class]="'tg-' + group.color">
                <div class="tg-header">
                  <span class="tg-icon">{{ group.icon }}</span>
                  <span class="tg-label">{{ group.label }}</span>
                </div>
                <div class="tg-questions">
                  <button *ngFor="let q of group.questions" class="tq-btn" (click)="ask(q)">{{ q }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div *ngFor="let msg of history; let i = index" class="msg-row" [class.msg-user]="msg.role === 'user'" [class.msg-ai]="msg.role === 'assistant'">
            <div *ngIf="msg.role === 'assistant'" class="avatar ai-avatar">AI</div>
            <div class="bubble">
              <div *ngIf="msg.role === 'assistant'" [innerHTML]="msg.content | aiMarkdown"></div>
              <div *ngIf="msg.role === 'user'">{{ msg.content }}</div>
              <div class="msg-meta">
                <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
                <button *ngIf="msg.role === 'assistant'" class="copy-btn" (click)="copy(msg.content, i)" [class.copied]="copiedIndex === i">
                  {{ copiedIndex === i ? 'Copied!' : 'Copy' }}
                </button>
              </div>
            </div>
            <div *ngIf="msg.role === 'user'" class="avatar user-avatar">You</div>
          </div>

          <!-- Typing indicator -->
          <div *ngIf="loading" class="msg-row msg-ai">
            <div class="avatar ai-avatar">AI</div>
            <div class="bubble typing-bubble">
              <span></span><span></span><span></span>
            </div>
          </div>

          <div #messagesEnd></div>
        </div>

        <!-- Quick topics while chatting -->
        <div *ngIf="history.length && !loading" class="quick-topics">
          <button *ngFor="let group of topicGroups" class="qt-chip" [class]="'qt-' + group.color" (click)="toggleGroup(group.id)">
            {{ group.icon }} {{ group.label }}
          </button>
        </div>
        <div *ngIf="activeGroup && history.length" class="inline-questions">
          <button *ngFor="let q of activeGroupQuestions" class="tq-btn small" (click)="ask(q)">{{ q }}</button>
        </div>

        <!-- Input -->
        <div class="input-row">
          <textarea
            #chatInput
            [(ngModel)]="userInput"
            (keydown)="onKeyDown($event)"
            placeholder="Ask about inventory, orders, reservations, users…"
            rows="1"
            class="chat-input"
          ></textarea>
          <button class="send-btn" (click)="send()" [disabled]="!userInput.trim() || loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <p class="input-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  `,
  styles: [`
    .ai-page { display: flex; flex-direction: column; height: calc(100vh - 60px); max-width: 900px; }
    .ai-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
    .ai-header-left { display: flex; align-items: center; gap: 1rem; }
    .ai-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex; align-items: center; justify-content: center;
    }
    .ai-icon svg { width: 26px; height: 26px; stroke: #fff; }
    .ai-header h1 { font-size: 1.35rem; font-weight: 800; color: #1e293b; margin: 0 0 .2rem; }
    .ai-header p { font-size: .8rem; color: #64748b; margin: 0; }
    .clear-btn {
      display: flex; align-items: center; gap: .4rem;
      padding: .45rem .9rem; border-radius: 8px;
      border: 1px solid #e2e8f0; background: #fff;
      font-size: .78rem; font-weight: 600; color: #475569;
      cursor: pointer; transition: all .15s;
    }
    .clear-btn:hover { border-color: #6366f1; color: #6366f1; }

    .chat-area {
      flex: 1; display: flex; flex-direction: column;
      background: #fff; border-radius: 16px; border: 1.5px solid #e2e8f0;
      overflow: hidden; min-height: 0;
    }

    .messages-wrap { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

    /* Empty state */
    .empty-state { padding: .5rem 0; }
    .empty-hint { font-size: .85rem; color: #94a3b8; text-align: center; margin: 0 0 1.5rem; }
    .topic-groups { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    @media (max-width: 700px) { .topic-groups { grid-template-columns: 1fr; } }
    .topic-group { border-radius: 12px; padding: 1rem; border: 1.5px solid #e2e8f0; }
    .tg-green { border-color: #bbf7d0; background: #f0fdf4; }
    .tg-orange { border-color: #fed7aa; background: #fff7ed; }
    .tg-blue { border-color: #bfdbfe; background: #eff6ff; }
    .tg-header { display: flex; align-items: center; gap: .5rem; margin-bottom: .75rem; }
    .tg-icon { font-size: 1.1rem; }
    .tg-label { font-size: .82rem; font-weight: 700; color: #334155; }
    .tg-questions { display: flex; flex-direction: column; gap: .4rem; }
    .tq-btn {
      text-align: left; padding: .4rem .65rem;
      border-radius: 7px; border: 1px solid #e2e8f0;
      background: #fff; font-size: .78rem; color: #475569;
      cursor: pointer; transition: all .15s; line-height: 1.4;
    }
    .tq-btn:hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
    .tq-btn.small { font-size: .75rem; padding: .3rem .55rem; }

    /* Messages */
    .msg-row { display: flex; align-items: flex-end; gap: .65rem; }
    .msg-user { flex-direction: row-reverse; }
    .avatar {
      width: 30px; height: 30px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: .65rem; font-weight: 700; flex-shrink: 0;
    }
    .ai-avatar { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
    .user-avatar { background: #f1f5f9; color: #475569; }
    .bubble {
      max-width: 72%; padding: .75rem 1rem;
      border-radius: 16px; font-size: .875rem; line-height: 1.6;
    }
    .msg-ai .bubble { background: #f8fafc; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; color: #1e293b; }
    .msg-user .bubble { background: #6366f1; color: #fff; border-bottom-right-radius: 4px; }
    .msg-meta { display: flex; align-items: center; gap: .5rem; margin-top: .4rem; }
    .msg-time { font-size: .68rem; color: #94a3b8; }
    .msg-user .msg-time { color: rgba(255,255,255,.65); }
    .copy-btn {
      font-size: .68rem; color: #94a3b8; background: none; border: none;
      cursor: pointer; padding: 0; transition: color .15s;
    }
    .copy-btn:hover, .copy-btn.copied { color: #6366f1; }

    /* Typing */
    .typing-bubble { padding: .85rem 1rem; display: flex; align-items: center; gap: .35rem; }
    .typing-bubble span {
      width: 7px; height: 7px; border-radius: 50%;
      background: #94a3b8; display: inline-block;
      animation: bounce .9s infinite;
    }
    .typing-bubble span:nth-child(2) { animation-delay: .15s; }
    .typing-bubble span:nth-child(3) { animation-delay: .3s; }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

    /* Quick topic chips */
    .quick-topics { padding: .5rem 1rem 0; display: flex; gap: .5rem; flex-wrap: wrap; }
    .qt-chip {
      padding: .3rem .75rem; border-radius: 20px; border: 1px solid;
      font-size: .75rem; font-weight: 600; cursor: pointer; transition: all .15s;
    }
    .qt-green { border-color: #86efac; color: #16a34a; background: #f0fdf4; }
    .qt-green:hover { background: #16a34a; color: #fff; border-color: #16a34a; }
    .qt-orange { border-color: #fdba74; color: #ea580c; background: #fff7ed; }
    .qt-orange:hover { background: #ea580c; color: #fff; border-color: #ea580c; }
    .qt-blue { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
    .qt-blue:hover { background: #2563eb; color: #fff; border-color: #2563eb; }

    .inline-questions { padding: .5rem 1rem; display: flex; flex-wrap: wrap; gap: .4rem; }

    /* Input */
    .input-row {
      display: flex; align-items: flex-end; gap: .65rem;
      padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; background: #f8fafc;
    }
    .chat-input {
      flex: 1; resize: none; border: 1.5px solid #e2e8f0; border-radius: 12px;
      padding: .65rem 1rem; font-size: .875rem; color: #1e293b;
      font-family: inherit; line-height: 1.5; outline: none;
      transition: border-color .15s; max-height: 140px; overflow-y: auto;
    }
    .chat-input:focus { border-color: #6366f1; }
    .send-btn {
      width: 42px; height: 42px; border-radius: 12px;
      border: none; background: #6366f1; color: #fff;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .15s; flex-shrink: 0;
    }
    .send-btn:hover:not(:disabled) { background: #4f46e5; }
    .send-btn:disabled { opacity: .4; cursor: not-allowed; }
    .input-hint { margin: 0; padding: .35rem 1.25rem .65rem; font-size: .68rem; color: #94a3b8; background: #f8fafc; }
  `]
})
export class CmsAiAssistantComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  userInput = '';
  loading = false;
  history: ChatMsg[] = [];
  copiedIndex: number | null = null;
  activeGroup: string | null = null;

  readonly topicGroups: TopicGroup[] = [
    {
      id: 'pharmacy', color: 'green', icon: '💊', label: 'Pharmacy',
      questions: [
        'Which medicines are low in stock?',
        'How many pending prescriptions are there?',
        'What are the most ordered medicines?',
        'Show me today\'s pharmacy orders'
      ]
    },
    {
      id: 'restaurant', color: 'orange', icon: '🍽️', label: 'Restaurant',
      questions: [
        'How many reservations are booked today?',
        'Which tables are currently available?',
        'What are the most popular menu items?',
        'List restaurants with rooftop dining'
      ]
    },
    {
      id: 'users', color: 'blue', icon: '👥', label: 'Users',
      questions: [
        'How many users registered this week?',
        'What is the ratio of admins to customers?',
        'Show me recently registered users',
        'How many active users does the platform have?'
      ]
    }
  ];

  get activeGroupQuestions(): string[] {
    return this.topicGroups.find(g => g.id === this.activeGroup)?.questions ?? [];
  }

  constructor(private restaurantService: RestaurantService) {}

  ngAfterViewChecked() {
    this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  toggleGroup(id: string) {
    this.activeGroup = this.activeGroup === id ? null : id;
  }

  ask(question: string) {
    this.activeGroup = null;
    this.userInput = question;
    this.send();
  }

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) return;

    this.history.push({ role: 'user', content: text, timestamp: new Date() });
    this.userInput = '';
    this.loading = true;

    const systemContext = `You are an AI assistant embedded in a unified CMS admin panel for a multi-service platform that includes:
1. Pharmacy Service – manages medicines, categories, prescriptions, and pharmacy orders.
2. Restaurant Service – manages restaurants, food categories, menu items, tables, and reservations.
3. User Service – manages platform users with roles (Admin, Customer).

You are speaking to an admin/operator. Provide helpful, concise, data-driven answers. When you cannot retrieve live data, explain what data to look for and how. Keep responses practical and admin-focused.`;

    const messages = [
      { role: 'user', content: `[System context: ${systemContext}]\n\nNow answer this: ${this.history[0].content}` },
      ...this.history.slice(1).map(m => ({ role: m.role, content: m.content }))
    ];

    this.restaurantService.chat(messages).subscribe({
      next: ({ reply }) => {
        this.history.push({ role: 'assistant', content: reply, timestamp: new Date() });
        this.loading = false;
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Unable to reach the AI service. Please check that the backend is running.';
        this.history.push({ role: 'assistant', content: msg, timestamp: new Date() });
        this.loading = false;
      }
    });
  }

  clearChat() {
    this.history = [];
    this.activeGroup = null;
  }

  copy(content: string, index: number) {
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
}
