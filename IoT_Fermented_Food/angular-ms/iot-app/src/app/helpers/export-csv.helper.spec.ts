import { jsonToCsv } from './export-csv.helper';

describe('ExportCsvUtil', () => {
  it('should convert a simple JSON array to CSV', () => {
    const data = [
      { name: 'John', age: 30, city: 'New York' },
      { name: 'Jane', age: 25, city: 'London' }
    ];
    const expectedCsv = 'name,age,city\nJohn,30,New York\nJane,25,London';
    expect(jsonToCsv(data)).toBe(expectedCsv);
  });

  it('should handle empty arrays by returning an empty string', () => {
    expect(jsonToCsv([])).toBe('');
  });

  it('should handle null or undefined values in objects', () => {
    const data = [
      { name: 'John', age: null, city: undefined },
      { name: 'Jane', age: 25, city: 'London' }
    ];
    // We expect null/undefined to be empty strings in CSV
    const expectedCsv = 'name,age,city\nJohn,,\nJane,25,London';
    expect(jsonToCsv(data)).toBe(expectedCsv);
  });

  it('should escape double quotes in values', () => {
    const data = [
      { name: 'John "The Boss"', age: 30 }
    ];
    const expectedCsv = 'name,age\n"John ""The Boss""",30';
    expect(jsonToCsv(data)).toBe(expectedCsv);
  });

  it('should wrap values with commas in double quotes', () => {
    const data = [
      { name: 'Doe, John', age: 30 }
    ];
    const expectedCsv = 'name,age\n"Doe, John",30';
    expect(jsonToCsv(data)).toBe(expectedCsv);
  });
});
