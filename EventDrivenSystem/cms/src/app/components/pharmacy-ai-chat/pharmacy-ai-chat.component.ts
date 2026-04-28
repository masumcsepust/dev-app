import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PharmacyService } from '../../services/pharmacy.service';
import { AiMarkdownPipe } from '../../pipes/ai-markdown.pipe';

interface ChatMsg { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'What medicines do you have for fever?',
  'Is paracetamol available?',
  'What are common antibiotic side effects?',
  'How do I submit a prescription?',
];

@Component({
  selector: 'app-pharmacy-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AiMarkdownPipe],
  templateUrl: './pharmacy-ai-chat.component.html',
  styleUrls: ['./pharmacy-ai-chat.component.css']
})
export class PharmacyAiChatComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  isOpen = false;
  loading = false;
  userInput = '';
  unread = 0;
  history: ChatMsg[] = [
    { role: 'assistant', content: 'Hi! I\'m PharmaAI 💊 Ask me anything about medicines, dosages, side effects, or how to submit a prescription!' }
  ];
  readonly suggestions = SUGGESTIONS;

  constructor(private pharmacyService: PharmacyService) {}

  ngAfterViewChecked() {
    try { this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  toggle() { this.isOpen = !this.isOpen; if (this.isOpen) this.unread = 0; }
  ask(q: string) { this.userInput = q; this.send(); }

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) return;
    this.history.push({ role: 'user', content: text });
    this.userInput = '';
    this.loading = true;
    this.pharmacyService.chat(this.history).subscribe({
      next: ({ reply }) => {
        this.history.push({ role: 'assistant', content: reply });
        this.loading = false;
        if (!this.isOpen) this.unread++;
      },
      error: (err) => {
        const msg = err?.error?.error ?? 'Sorry, I\'m having trouble connecting. Please try again!';
        this.history.push({ role: 'assistant', content: msg });
        this.loading = false;
        if (!this.isOpen) this.unread++;
      }
    });
  }

  clearChat() { this.history = [this.history[0]]; }
  onKeyDown(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); } }
  get showSuggestions() { return this.history.length === 1 && !this.loading; }
}
