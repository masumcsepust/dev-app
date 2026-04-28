import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PharmacyService } from '../../services/pharmacy.service';
import { AiMarkdownPipe } from '../../pipes/ai-markdown.pipe';

interface ChatMsg { role: 'user' | 'assistant'; content: string; timestamp: Date; }

const TOPICS = [
  { label: 'Medicines', icon: '💊', questions: ['What medicines are available for diabetes?', 'Do you have any antibiotics in stock?', 'What is the difference between brand and generic?', 'Show me available syrups for children'] },
  { label: 'Dosage & Safety', icon: '⚕️', questions: ['What is the standard paracetamol dosage?', 'Can I take ibuprofen with antibiotics?', 'What are common drug interactions to avoid?', 'How should I store medicines at home?'] },
  { label: 'Prescriptions', icon: '📋', questions: ['How do I submit a prescription?', 'Which medicines require a prescription?', 'How long does prescription approval take?', 'Can I get a prescription renewal?'] },
  { label: 'Side Effects', icon: '⚠️', questions: ['What are the side effects of metformin?', 'How do I manage antibiotic side effects?', 'When should I stop taking a medicine?', 'What to do in case of allergic reaction?'] },
];

@Component({
  selector: 'app-pharmacy-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AiMarkdownPipe],
  templateUrl: './pharmacy-ai-assistant.component.html',
  styleUrls: ['./pharmacy-ai-assistant.component.css']
})
export class PharmacyAiAssistantComponent implements AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  history: ChatMsg[] = [
    { role: 'assistant', content: 'Hello! I\'m PharmaAI, your personal pharmacy assistant. I can help you find medicines, understand dosages, side effects, and more. How can I help you today?', timestamp: new Date() }
  ];
  userInput = '';
  loading = false;
  expandedTopic: number | null = null;
  copiedIdx: number | null = null;
  readonly topics = TOPICS;

  constructor(private pharmacyService: PharmacyService) {}

  ngAfterViewChecked() {
    try { this.messagesEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  ask(question: string) { this.userInput = question; this.send(); this.expandedTopic = null; }

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) return;
    this.history.push({ role: 'user', content: text, timestamp: new Date() });
    this.userInput = '';
    this.loading = true;
    this.pharmacyService.chat(this.history.map(m => ({ role: m.role, content: m.content }))).subscribe({
      next: ({ reply }) => { this.history.push({ role: 'assistant', content: reply, timestamp: new Date() }); this.loading = false; },
      error: (err) => { const msg = err?.error?.error ?? 'Connection error. Please try again.'; this.history.push({ role: 'assistant', content: msg, timestamp: new Date() }); this.loading = false; }
    });
  }

  copyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content).then(() => { this.copiedIdx = idx; setTimeout(() => this.copiedIdx = null, 1800); });
  }

  clearChat() { this.history = [this.history[0]]; }
  onKeyDown(e: KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); } }
  toggleTopic(i: number) { this.expandedTopic = this.expandedTopic === i ? null : i; }
}
