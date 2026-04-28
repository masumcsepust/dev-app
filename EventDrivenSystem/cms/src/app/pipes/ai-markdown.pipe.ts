import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'aiMarkdown', standalone: true })
export class AiMarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): SafeHtml {
    // Escape HTML entities first to prevent XSS from AI output
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Inline formatting
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Block rendering: handle bullet/numbered lists and paragraphs
    const lines = html.split('\n');
    const out: string[] = [];
    let inUl = false;
    let inOl = false;

    for (const line of lines) {
      const ulMatch = line.match(/^[-•]\s+(.+)/);
      const olMatch = line.match(/^\d+\.\s+(.+)/);

      if (ulMatch) {
        if (inOl) { out.push('</ol>'); inOl = false; }
        if (!inUl) { out.push('<ul>'); inUl = true; }
        out.push(`<li>${ulMatch[1]}</li>`);
      } else if (olMatch) {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (!inOl) { out.push('<ol>'); inOl = true; }
        out.push(`<li>${olMatch[1]}</li>`);
      } else {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
        out.push(line.trim() === '' ? '<br>' : `${line}<br>`);
      }
    }

    if (inUl) out.push('</ul>');
    if (inOl) out.push('</ol>');

    return this.sanitizer.bypassSecurityTrustHtml(out.join(''));
  }
}
