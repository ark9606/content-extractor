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
  async parse(url: string, pageHtml?: string): Promise<ParsedData> {
    let html = pageHtml;
    if (!html && url) {
      html = await this.getHtmlByURL(url);
    }
    const $ = cheerio.load(html);
    let pointer = $('div#content h1');
    const name = pointer.text();

    pointer = pointer.next();
    const datetime = this.parseDate(pointer.text());

    pointer = pointer.next();
    const descriptionLines = [];
    while (pointer.is('p')) {
      const txt = pointer
        .text()
        .trim()
        .replace(/(?:\r\n|\r|\n)/g, '');
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
      .map((i, el) => $(el).text())
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

  private async getHtmlByURL(url: string): Promise<string> {
    const { data } = await axios.get(url);
    return data;
  }

  private parseDate(text: string): Date {
    return moment(text, 'DD.MM.YYYY a HH:mm', 'de').toDate();
  }
}
