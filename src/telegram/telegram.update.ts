import { Action, Command, Start, Update } from 'nestjs-telegraf';
import { COMMANDS } from 'src/constants/COMMANDS';
import { GoogleService } from 'src/google/google.service';
import { Context, Markup, Scenes } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(private readonly googleService: GoogleService) {}

  @Start()
  startCommand(ctx: Context) {
    ctx.reply('Первый привет из этого болота');
  }
  //todo Информация про таблицу. Сколько цитат, какие имеются листы ссылка на таблицу и кнопка добавления новой или замена текущей
  @Command(COMMANDS.sheet)
  @Action('show-information')
  async sheetCommand(ctx: Scenes.SceneContext) {
    const sheet = await this.googleService.getCurrentSpreadsheet();

    const { message_id } = await ctx.reply(
      'Собираю инфу...',
      Markup.removeKeyboard(),
    );

    if (!sheet) {
      ctx.reply(
        'Кажется, вы еще не добавили таблицу с цитатами. Добавьте, используя /add',
      );
      ctx.deleteMessage(message_id);
      return;
    }

    let quoterCount: number | string;

    try {
      quoterCount = await this.googleService.getCount();
    } catch (error) {
      console.log(error);
      quoterCount = 'Ошибка подсчета';
    }

    ctx.deleteMessage(message_id);

    ctx.reply(
      `Таблица: \`${sheet.title}\`\nСтраницы:${sheet.sheets.map(
        (list) => ` \`${list.properties.title}\` `,
      )}\nКоличество цитат: \`${quoterCount}\``,
      {
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
            [
              {
                text: `${sheet.title}`,
                url: `${sheet.spreadsheetUrl}`,
              },
            ],
          ],
        },
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      },
    );
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
      ctx.deleteMessage(message_id);
      ctx.reply('Похоже, в моих чертогах произошел сбой...Спрос c разраба');
    }
  }
}
