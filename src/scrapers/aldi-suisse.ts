import { AldiSued } from './aldi-sued';

export class AldiSuisse extends AldiSued {
  static host(domain: string = 'aldi-suisse.ch'): string {
    return domain;
  }

  static canScrape(url: string): boolean {
    return url.includes('aldi-suisse.ch');
  }

  siteName(): string {
    return 'ALDI Suisse';
  }
}