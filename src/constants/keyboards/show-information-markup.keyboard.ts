import { SpreadsheetInformationDto } from 'src/google/dto/spreadsheet.dto';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { ACTIONS } from '../ACTIONS';

export const ShowInformationMarkup = ({
  title,
  spreadsheetUrl,
}: SpreadsheetInformationDto): ExtraReplyMessage => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Новая таблица',
            callback_data: 'add-spreadsheet-callback',
          },
        ],
        [
          {
            text: 'Удалить',
            callback_data: 'delete-current-spreadsheet',
          },
        ],
        [
          {
            text: `${title}`,
            url: `${spreadsheetUrl}`,
          },
        ],
        [
          {
            text: 'Расписание',
            callback_data: ACTIONS.menuInterval,
          },
        ],
      ],
    },
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  };
};
