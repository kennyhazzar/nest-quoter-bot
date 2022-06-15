import { Action, Command, Start, Update } from 'nestjs-telegraf';
import { COMMANDS } from 'src/constants/COMMANDS';
import { GoogleService } from 'src/google/google.service';
import { Context, Scenes } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(private readonly googleService: GoogleService) {}

  @Start()
  startCommand(ctx: Context) {
    ctx.reply('Первый привет из этого болота');
  }
  //todo Информация про таблицу. Сколько цитат, какие имеются листы ссылка на таблицу и кнопка добавления новой или замена текущей
  @Command(COMMANDS.sheet)
  async sheetCommand(ctx: Scenes.SceneContext) {
    const sheet = await this.googleService.getCurrentSpreadsheet();

    if (!sheet) {
      ctx.reply(
        'Кажется, вы еще не добавили таблицу с цитатами. Добавьте, используя /add',
      );
      return;
    }

    ctx.reply('nothing to send', {
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
              text: 'Удалить текущую',
              callback_data: 'delete-current-spreadsheet',
            },
          ],
        ],
      },
    }); //! Нужно сообщение с инлайн кнопками, краткой инфой про таблицу и ссылку на нее
  }

  @Command(COMMANDS.schedule)
  scheduleCommand(ctx: Context) {
    ctx.reply(
      'Просмотр информации по текущему расписанию. Добавление и удаление ремайндеров',
    );
  }

  @Command(COMMANDS.add)
  addSheetViaCommand(ctx: Scenes.SceneContext) {
    ctx.scene.enter('add-spreadsheet');
  }

  @Action('add-spreadsheet-callback')
  addSpreadsheetCallback(ctx: Scenes.SceneContext) {
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.scene.enter('add-spreadsheet');
  }

  @Action('delete-current-spreadsheet')
  async deleteCurrentSpreadsheet(ctx: Scenes.SceneContext) {
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    const { message_id } = await ctx.reply('Удаляем...');
    try {
      await this.googleService.deleteSpreadsheet();
      ctx.deleteMessage(message_id);
      ctx.reply(
        'Таблица успешно удалена из базы данных. Чтобы добавить снова, используйте /add',
      );
    } catch (error) {
      console.log(error);
      ctx.reply('Похоже, в моих чертогах произошел сбой...Спрос c разраба');
    }
  }
}
