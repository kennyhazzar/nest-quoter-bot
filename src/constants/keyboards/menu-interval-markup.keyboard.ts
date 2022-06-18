import { ACTIONS } from '../ACTIONS';

export const MenuIntervalMarkup = () => {
  return {
    reply_markup: {
      remove_keyboard: true,
      inline_keyboard: [
        [{ text: 'Меню интервалов', callback_data: ACTIONS.menuInterval }],
      ],
    },
  };
};
