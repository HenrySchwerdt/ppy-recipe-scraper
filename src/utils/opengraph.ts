import * as cheerio from 'cheerio';

export class OpenGraph {
  private $: cheerio.CheerioAPI;

  constructor($: cheerio.CheerioAPI) {
    this.$ = $;
  }

  title(): string | undefined {
    return this.$('meta[property="og:title"]').attr('content');
  }

  description(): string | undefined {
    return this.$('meta[property="og:description"]').attr('content');
  }

  image(): string | undefined {
    return this.$('meta[property="og:image"]').attr('content');
  }

  url(): string | undefined {
    return this.$('meta[property="og:url"]').attr('content');
  }

  siteName(): string | undefined {
    return this.$('meta[property="og:site_name"]').attr('content');
  }

  locale(): string | undefined {
    return this.$('meta[property="og:locale"]').attr('content');
  }

  type(): string | undefined {
    return this.$('meta[property="og:type"]').attr('content');
  }
}