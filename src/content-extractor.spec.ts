import { ContentExtractor } from './content-extractor';

describe('ContentExtractor', () => {
  const extractor = new ContentExtractor();

  it('should be defined', () => {
    expect(extractor).toBeDefined();
  });

  it('should return information about event via URL', async () => {
    const res = await extractor.parse(
      'https://www.holzwickede.de/veranstaltungen/7/2159586/2020/05/06/charles-p%C3%A9guy-ein-vortragsabend-mit-joseph-hanimann.html',
    );
    checkParsedData(res);
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
