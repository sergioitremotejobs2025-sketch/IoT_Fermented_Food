import { TestBed } from '@angular/core/testing';
import { DataExportService } from './data-export.service';
import { jsonToCsv } from '../helpers/export-csv.helper';

describe('DataExportService', () => {
  let service: DataExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataExportService]
    });
    service = TestBed.inject(DataExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportToCsv', () => {
    it('should trigger a file download', () => {
      const data = [{ a: 1, b: 2 }];
      const filename = 'test.csv';
      
      // Spy on document.createElement
      const mockAnchor = {
        click: jasmine.createSpy('click'),
        setAttribute: jasmine.createSpy('setAttribute'),
        style: { display: '' },
        href: ''
      } as any;
      
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'a') return mockAnchor;
        return document.createElement(tagName);
      });
      
      // Spy on document.body.appendChild and removeChild
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      
      // Spy on URL.createObjectURL and revokeObjectURL
      const mockUrl = 'blob:http://localhost:4200/some-uuid';
      spyOn(URL, 'createObjectURL').and.returnValue(mockUrl);
      spyOn(URL, 'revokeObjectURL');

      service.exportToCsv(data, filename);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.setAttribute).toHaveBeenCalledWith('download', filename);
      expect(mockAnchor.href).toBe(mockUrl);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });
});
