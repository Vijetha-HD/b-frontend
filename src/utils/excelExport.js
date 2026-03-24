import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file (.xlsx)
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} fileName - Name of the file without extension
 */
export const exportToExcel = (data, fileName = 'export') => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Exports data to a CSV file (.csv)
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} fileName - Name of the file without extension
 */
export const exportToCSV = (data, fileName = 'export') => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.csv`);
};
