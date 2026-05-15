import * as XLSX from 'xlsx';

export function readExcel(filePath: string, sheetName: string) {
  const workbook = XLSX.readFile(filePath);

  console.log("Available sheets:", workbook.SheetNames);

  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  const data = XLSX.utils.sheet_to_json(sheet);
  return data;
}

export function updateExcelCell(
  filePath: string,
  sheetName: string,
  rowIndex: number,
  columnName: string,
  newValue: string
) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];

  const data: any[] = XLSX.utils.sheet_to_json(sheet);

  data[rowIndex][columnName] = newValue;

  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;

  XLSX.writeFile(workbook, filePath);
}
