import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyService, ChatMessage } from '../../services/pharmacy.service';
import { AiMarkdownPipe } from '../../pipes/ai-markdown.pipe';

const TOPICS_EN = [
  { label: 'Dosage Guide', prompt: 'How do I find the right dosage for a medicine?' },
  { label: 'Side Effects', prompt: 'What are common medication side effects I should know about?' },
  { label: 'Drug Interactions', prompt: 'What are dangerous drug interactions I should avoid?' },
  { label: 'Storage Tips', prompt: 'How should I store different types of medicines?' },
  { label: 'Prescription Meds', prompt: 'Which medicines require a prescription and why?' },
  { label: 'Antibiotics', prompt: 'What should I know about taking antibiotics?' },
  { label: 'Pain Relief', prompt: 'What pain relief options are available without a prescription?' },
  { label: 'Vitamins & Supplements', prompt: 'What vitamins and supplements do you carry?' },
];

const TOPICS_BN = [
  { label: 'ডোজ গাইড', prompt: 'ওষুধের সঠিক ডোজ কীভাবে খুঁজে পাব?' },
  { label: 'পার্শ্বপ্রতিক্রিয়া', prompt: 'সাধারণ ওষুধের পার্শ্বপ্রতিক্রিয়া কী কী জানা উচিত?' },
  { label: 'ড্রাগ ইন্টারঅ্যাকশন', prompt: 'কোন ওষুধের সংমিশ্রণ এড়ানো উচিত?' },
  { label: 'সংরক্ষণ টিপস', prompt: 'বিভিন্ন ওষুধ কীভাবে সংরক্ষণ করব?' },
  { label: 'প্রেসক্রিপশন ওষুধ', prompt: 'কোন ওষুধে প্রেসক্রিপশন লাগে এবং কেন?' },
  { label: 'অ্যান্টিবায়োটিক', prompt: 'অ্যান্টিবায়োটিক খাওয়ার সময় কী জানা দরকার?' },
  { label: 'ব্যথা উপশম', prompt: 'প্রেসক্রিপশন ছাড়া কোন ব্যথার ওষুধ পাওয়া যায়?' },
  { label: 'ভিটামিন ও সাপ্লিমেন্ট', prompt: 'আপনাদের কাছে কোন ভিটামিন ও সাপ্লিমেন্ট আছে?' },
];

const GREETINGS: Record<string, string> = {
  en: 'Hello! I\'m **PharmaAI**, your personal pharmacy assistant.\n\nAsk me anything about medicines, dosages, side effects, or use the quick topics on the left to get started!',
  bn: 'হ্যালো! আমি **PharmaAI**, আপনার ব্যক্তিগত ফার্মেসি সহকারী।\n\nওষুধ, ডোজ, পার্শ্বপ্রতিক্রিয়া সম্পর্কে যেকোনো প্রশ্ন করুন, অথবা বাম দিকের বিষয়গুলো ব্যবহার করে শুরু করুন!'
};

@Component({
  selector: 'app-pharmacy-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, AiMarkdownPipe],
  templateUrl: './pharmacy-ai-assistant.component.html',
  styleUrl: './pharmacy-ai-assistant.component.css'
})
export class PharmacyAiAssistantComponent implements AfterViewChecked {
  @ViewChild('msgEnd') msgEnd!: ElementRef;

  language: 'en' | 'bn' = 'en';
  topics = TOPICS_EN;
  messages: ChatMessage[] = [{ role: 'assistant', content: GREETINGS['en'] }];
  input = '';
  loading = false;

  constructor(private svc: PharmacyService) {}

  ngAfterViewChecked() { this.msgEnd?.nativeElement.scrollIntoView({ behavior: 'smooth' }); }

  switchLang(lang: 'en' | 'bn') {
    this.language = lang;
    this.topics = lang === 'bn' ? TOPICS_BN : TOPICS_EN;
    this.messages = [{ role: 'assistant', content: GREETINGS[lang] }];
  }

  send(text?: string) {
    const msg = (text ?? this.input).trim();
    if (!msg || this.loading) return;
    this.messages.push({ role: 'user', content: msg });
    this.input = '';
    this.loading = true;
    this.svc.chat(this.messages, this.language).subscribe({
      next: r => { this.messages.push({ role: 'assistant', content: r.reply }); this.loading = false; },
      error: () => {
        const err = this.language === 'bn'
          ? 'দুঃখিত, একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।'
          : 'Sorry, an error occurred. Please try again.';
        this.messages.push({ role: 'assistant', content: err });
        this.loading = false;
      }
    });
  }

  clear() { this.messages = [{ role: 'assistant', content: GREETINGS[this.language] }]; }
}
