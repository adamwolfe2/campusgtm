/**
 * Client-side download utilities for Campus GTM
 * Handles browser downloads for CSV, JSON, and other file types
 */

/**
 * Trigger browser download for CSV data
 * @param csvString - The CSV content as a string
 * @param filename - The desired filename (without extension)
 */
export function downloadCSV(csvString: string, filename: string): void {
  // Ensure filename has .csv extension
  const fullFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });

  triggerDownload(blob, fullFilename);
}

/**
 * Trigger browser download for JSON data
 * @param data - The data object to convert to JSON
 * @param filename - The desired filename (without extension)
 */
export function downloadJSON(data: any, filename: string): void {
  // Ensure filename has .json extension
  const fullFilename = filename.endsWith('.json') ? filename : `${filename}.json`;

  // Convert data to pretty JSON
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });

  triggerDownload(blob, fullFilename);
}

/**
 * Trigger browser download for HTML content
 * @param htmlString - The HTML content as a string
 * @param filename - The desired filename (without extension)
 */
export function downloadHTML(htmlString: string, filename: string): void {
  // Ensure filename has .html extension
  const fullFilename = filename.endsWith('.html') ? filename : `${filename}.html`;

  const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8;' });

  triggerDownload(blob, fullFilename);
}

/**
 * Trigger browser download for plain text
 * @param textString - The text content as a string
 * @param filename - The desired filename (without extension)
 */
export function downloadText(textString: string, filename: string): void {
  // Ensure filename has .txt extension
  const fullFilename = filename.endsWith('.txt') ? filename : `${filename}.txt`;

  const blob = new Blob([textString], { type: 'text/plain;charset=utf-8;' });

  triggerDownload(blob, fullFilename);
}

/**
 * Core download function - creates a temporary link and triggers download
 * @param blob - The blob to download
 * @param filename - The filename to use
 */
function triggerDownload(blob: Blob, filename: string): void {
  try {
    // Create object URL
    const url = URL.createObjectURL(blob);

    // Create temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Append to body (required for Firefox)
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup
    document.body.removeChild(link);

    // Revoke object URL after a short delay to ensure download started
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Copy text to clipboard
 * @param text - The text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Modern Clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for older browsers or non-secure contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    throw new Error(`Failed to copy to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a timestamped filename
 * @param baseName - The base name for the file
 * @param extension - The file extension (without dot)
 * @returns Filename with timestamp
 */
export function generateTimestampedFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // YYYY-MM-DDTHH-MM-SS
  return `${baseName}-${timestamp}.${extension}`;
}

/**
 * Format bytes to human-readable size
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
