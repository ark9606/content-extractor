import * as fs from 'fs';
import { ContentExtractor, ParsedData } from '../content-extractor';

const exampleHTML = fs.readFileSync(__dirname + '/page-example.html');
const exampleParsedData: ParsedData = {
  name: 'Charles Péguy - ein Vortragsabend mit Joseph Hanimann',
  description:
    'Der Kulturkorrespondent der Süddeutschen Zeitung in Paris stellt den Dichter, Essayisten und Zeitschriftengründer Charles Péguy vor: "Ein französischer Kämpfer für eine geistige Neubegründung der Republik".\r\nFreier Eintritt.',
  datetime: new Date('2020-05-06T16:00:00.000Z'),
  primaryImageUrl:
    'https://fotos.verwaltungsportal.de/veranstaltungen/2/1/5/9/5/8/6/gross/212402986.jpg',
  place: 'Zentrum für Information und Bildung Unna, Lindenplatz 1, 59423 Unna',
  organizer:
    'Freundeskreis Holzwickede Louviers eV in Kooperation mit der VHS Unna-Fröndenberg-Holzwickede',
};

describe('ContentExtractor', () => {
  const extractor = new ContentExtractor();

  it('should be defined', () => {
    expect(extractor).toBeDefined();
  });

  it('parses information via URL from task', async () => {
    const res = await extractor.parse(
      'https://www.holzwickede.de/veranstaltungen/7/2159586/2020/05/06/charles-p%C3%A9guy-ein-vortragsabend-mit-joseph-hanimann.html',
    );
    checkParsedData(res);
  });

  it('parses information via page HTML from task', async () => {
    const res = await extractor.parse(null, exampleHTML.toString('utf8'));
    checkParsedData(res);
    // Strict comparison of parsed data
    expect(res.name).toEqual(exampleParsedData.name);
    expect(res.description).toEqual(exampleParsedData.description);
    expect(res.datetime.toISOString()).toEqual(
      exampleParsedData.datetime.toISOString(),
    );
    expect(res.primaryImageUrl).toEqual(exampleParsedData.primaryImageUrl);
    expect(res.place).toEqual(exampleParsedData.place);
    expect(res.organizer).toEqual(exampleParsedData.organizer);
  });

  it('parses information from similar pages via URLs', async () => {
    const links = [
      'https://www.holzwickede.de/veranstaltungen/13/2159585/2020/05/04/franz%C3%B6sischer-filmabend-in-deutscher-sprache.html',
      'https://www.holzwickede.de/veranstaltungen/23/2157514/2020/05/07/4-f%C3%BC%C3%9Fe-im-3-4-takt-%E2%80%93-tanzkurs,-grundstufe.html',
      'https://www.holzwickede.de/veranstaltungen/3/2170055/2020/05/29/floyd-side-of-the-moon.html',
      'https://www.holzwickede.de/veranstaltungen/23/2157515/2020/05/13/70-jahre-schuman-plan-%E2%80%93-70-jahre-europa-%E2%80%93-eine-bilanz!.html',
    ];
    for (const link of links) {
      const res = await extractor.parse(link);
      checkParsedData(res);
    }
  });

  function checkParsedData(data: any) {
    expect(data).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        datetime: expect.any(Date),
        primaryImageUrl: expect.any(String),
        place: expect.any(String),
        organizer: expect.any(String),
      }),
    );
  }
});
