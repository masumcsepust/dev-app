import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, ChatMessage } from '../../services/pharmacy.service';
import { AiMarkdownPipe } from '../../pipes/ai-markdown.pipe';

@Component({
  selector: 'app-pharmacy-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, AiMarkdownPipe],
  templateUrl: './pharmacy-ai-chat.component.html',
  styleUrl: './pharmacy-ai-chat.component.css'
})
export class PharmacyAiChatComponent {
  open = false;
  language: 'en' | 'bn' = 'en';
  messages: ChatMessage[] = [
    { role: 'assistant', content: 'Hi! I\'m PharmaAI. Ask me about medicines, dosages, or anything pharmacy-related!' }
  ];
  input = '';
  loading = false;

  constructor(private svc: PharmacyService) {}

  toggle() { this.open = !this.open; }

  switchLang(lang: 'en' | 'bn') {
    this.language = lang;
    const greeting = lang === 'bn'
      ? 'হ্যালো! আমি PharmaAI। ওষুধ, ডোজ বা যেকোনো ফার্মেসি বিষয়ে জিজ্ঞেস করুন!'
      : 'Hi! I\'m PharmaAI. Ask me about medicines, dosages, or anything pharmacy-related!';
    this.messages = [{ role: 'assistant', content: greeting }];
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading) return;
    this.messages.push({ role: 'user', content: text });
    this.input = '';
    this.loading = true;
    this.svc.chat(this.messages, this.language).subscribe({
      next: r => { this.messages.push({ role: 'assistant', content: r.reply }); this.loading = false; },
      error: () => { this.messages.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }); this.loading = false; }
    });
  }
}
