import { ACTIONS } from 'src/constants/ACTIONS';

export const AddSpreadsheetMarkup = () => {
  return {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [
          {
            text: 'Добавить',
            callback_data: ACTIONS.addSpreadsheetCallback,
          },
        ],
      ],
    },
  };
};
