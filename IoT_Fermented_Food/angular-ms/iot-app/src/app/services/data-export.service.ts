import { Injectable } from '@angular/core';
import { jsonToCsv } from '../helpers/export-csv.helper';

@Injectable({
  providedIn: 'root'
})
export class DataExportService {

  constructor() { }

  /**
   * Exports data to a CSV file and triggers a download in the browser.
   * @param data Array of objects to export.
   * @param filename Desired filename (e.g., 'data.csv').
   */
  exportToCsv(data: any[], filename: string): void {
    const csvData = jsonToCsv(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Exports data to a JSON file and triggers a download in the browser.
   * @param data Array of objects to export.
   * @param filename Desired filename (e.g., 'data.json').
   */
  exportToJson(data: any[], filename: string): void {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
