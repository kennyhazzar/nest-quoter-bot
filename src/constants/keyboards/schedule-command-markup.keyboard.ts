import { ACTIONS } from '../ACTIONS';

export const ScheduleCommandMarkup = () => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Список интервалов',
            callback_data: ACTIONS.intervalList,
          },
        ],
        [
          {
            text: 'Удаление интервала',
            callback_data: ACTIONS.deleteInterval,
          },
        ],
        [
          {
            text: 'Добавление интервала',
            callback_data: ACTIONS.addInterval,
          },
        ],
        [
          {
            text: 'Информация о таблице',
            callback_data: ACTIONS.showInformation,
          },
        ],
      ],
    },
  };
};
