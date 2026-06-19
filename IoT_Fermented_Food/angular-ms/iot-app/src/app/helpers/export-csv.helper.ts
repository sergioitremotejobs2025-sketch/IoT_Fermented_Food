/**
 * Converts an array of objects into a CSV string.
 * @param data Array of objects to convert.
 * @returns A CSV formatted string.
 */
export function jsonToCsv(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      let escaped = val === null || val === undefined ? '' : String(val);

      // If value contains comma, double quote or newline, wrap it in double quotes and escape internal double quotes
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        escaped = `"${escaped.replace(/"/g, '""')}"`;
      }
      return escaped;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
