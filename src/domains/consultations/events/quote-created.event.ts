import { Quote } from '../entities/quote.entity';

export class QuoteCreatedEvent {
  constructor(public readonly quote: Quote) {}
}
