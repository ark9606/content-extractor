import * as cheerio from 'cheerio';
import * as moment from 'moment';
import axios from 'axios';

export interface ParsedData {
  name: string;
  description: string;
  datetime: Date;
  primaryImageUrl: string;
  place: string;
  organizer: string;
}

export class ContentExtractor {
  async parse(url?: string, pageHtml?: string): Promise<ParsedData> {
    let html = await this.getHtml(url, pageHtml);
    const $ = cheerio.load(html);
    let pointer = $('div#content h1');
    const name = pointer.text();

    pointer = pointer.next();
    const datetime = this.parseDate(pointer.text());

    pointer = pointer.next();
    const descriptionLines = [];
    while (pointer.is('p')) {
      const txt = this.cleanText(pointer.text());
      if (!!txt) {
        descriptionLines.push(txt);
      }
      pointer = pointer.next();
    }
    const description = descriptionLines.join('\r\n');

    const imgContainer = pointer.next();
    const primaryImageUrl = imgContainer.children('a').first().attr('href');

    const [place, organizer] = imgContainer
      .nextAll('h5')
      .map((i, el) => this.cleanText($(el).text()))
      .toArray() as unknown[];

    return {
      name,
      description,
      datetime,
      primaryImageUrl,
      place: place as string,
      organizer: organizer as string,
    };
  }

  private async getHtml(url?: string, pageHtml?: string): Promise<string> {
    if (!url && !pageHtml) {
      throw new Error('URL or page HTML must be provided');
    }
    if (url) {
      return this.getHtmlByURL(url);
    }
    return pageHtml;
  }

  private async getHtmlByURL(url: string): Promise<string> {
    const { data } = await axios.get(url);
    return data;
  }

  private cleanText(text: string): string {
    return text.trim().replace(/(?:\r\n|\r|\n)/g, '');
  }

  private parseDate(text: string): Date {
    return moment(text, 'DD.MM.YYYY a HH:mm', 'de').toDate();
  }
}
