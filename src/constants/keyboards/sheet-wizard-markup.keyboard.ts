import { SpreadsheetInformationDto } from 'src/google/dto/spreadsheet.dto';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

export const SheetWizardMarkup = ({
  title,
  spreadsheetUrl,
}: SpreadsheetInformationDto): ExtraReplyMessage => {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: title, url: spreadsheetUrl }],
        [{ text: 'Посмотреть', callback_data: 'show-information' }],
      ],
    },
    parse_mode: 'Markdown',
  };
};
