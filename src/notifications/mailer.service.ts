import { Injectable } from '@nestjs/common';

export interface SentMail {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class MailerService {
  readonly sent: SentMail[] = [];

  send(to: string, subject: string, body: string): void {
    console.log(`[mail] a ${to}: ${subject}`);
    this.sent.push({ to, subject, body });
  }
}
