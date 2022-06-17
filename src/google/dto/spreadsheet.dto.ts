export class SpreadsheetInformationResponseDto {
  properties: {
    title: string;
    locale: string;
    autoRecalc: string;
    timeZone: string;
  };
  sheets: Sheet[];
  spreadsheetUrl: string;
}

export class SpreadsheetInformationDto {
  spreadsheetId: string;
  title: string;
  locale: string;
  autoRecalc: string;
  timeZone: string;
  sheets: Sheet[];
  spreadsheetUrl: string;
}

export type Sheet = {
  properties: {
    sheetId: number;
    title: string;
    index: number;
    sheetType: string;
    gridProperties: {
      rowCount: number;
      columnCount: number;
    };
  };
};
