import { ACTIONS } from '../ACTIONS';

export const DeleteIntervalMarkup = () => {
  return {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [{ text: 'Добавить интервал', callback_data: ACTIONS.addInterval }],
        [
          {
            text: 'Информация про таблицу',
            callback_data: ACTIONS.showInformation,
          },
        ],
        [{ text: 'Расписание', callback_data: ACTIONS.menuInterval }],
      ],
    },
  };
};
