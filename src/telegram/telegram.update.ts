import { SchedulerRegistry } from '@nestjs/schedule';
import { Action, Command, Start, Update } from 'nestjs-telegraf';
import { AbortMarkup } from 'src/constants/AbortMarkup';
import { ACTIONS } from 'src/constants/ACTIONS';
import { COMMANDS } from 'src/constants/COMMANDS';
import { WIZARDS } from 'src/constants/WIZARDS';
import { GoogleService } from 'src/google/google.service';
import { Context, Markup, Scenes } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly googleService: GoogleService,
    private schedulerRegisty: SchedulerRegistry,
  ) {}

  @Start()
  startCommand(ctx: Context) {
    ctx.reply('Первый привет из этого болота');
  }

  @Command(COMMANDS.sheet)
  @Action(ACTIONS.showInformation)
  async sheetCommand(ctx: Scenes.SceneContext) {
    const sheet = await this.googleService.getCurrentSpreadsheet();

    if (ctx?.callbackQuery?.message?.message_id) {
      ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    }

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
  @Action(ACTIONS.menuInterval)
  scheduleCommand(ctx: Context) {
    if (ctx?.callbackQuery?.message?.message_id) {
      ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    }
    ctx.reply(
      'Просмотр информации по текущему расписанию. Добавление и удаление интервалов',
      {
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
          ],
        },
      },
    );
  }

  @Command(COMMANDS.add)
  addSheetViaCommand(ctx: Scenes.SceneContext) {
    ctx.scene.enter('add-spreadsheet');
  }

  @Action(ACTIONS.addSpreadsheetCallback)
  addSpreadsheetCallback(ctx: Scenes.SceneContext) {
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.scene.enter('add-spreadsheet');
  }

  @Action(ACTIONS.deleteCurrentSpreadsheet)
  async deleteCurrentSpreadsheet(ctx: Scenes.SceneContext) {
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    const { message_id } = await ctx.reply('Удаляем...');
    try {
      await this.googleService.deleteSpreadsheet();
      const intervals = this.schedulerRegisty.getIntervals();
      if (intervals) {
        intervals.map((interval) =>
          this.schedulerRegisty.deleteInterval(interval),
        );
      }
      ctx.deleteMessage(message_id);
      ctx.reply(
        'Таблица успешно удалена из базы данных. А также удалены все интервалы. Чтобы добавить снова, используйте /add',
      );
    } catch (error) {
      console.log(error);
      ctx.deleteMessage(message_id);
      ctx.reply('Похоже, в моих чертогах произошел сбой...Спрос c разраба');
    }
  }

  @Action(ACTIONS.intervalList)
  getListInterval(ctx: Context) {
    ctx.deleteMessage();
    const intervals = this.schedulerRegisty.getIntervals();
    ctx.replyWithMarkdown(
      'Показывает список активных интервалов, их информация, имя и т.д. (пока только имена):\n' +
        `${
          intervals.length != 0
            ? intervals.map(
                (interval, index) => '\n' + `${index + 1}. \`${interval}\``,
              )
            : 'У вас пока нету интервалов'
        }`,
      {
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [{ text: 'Меню интервалов', callback_data: ACTIONS.menuInterval }],
          ],
        },
      },
    );
  }

  @Command(COMMANDS.addInterval)
  @Action(ACTIONS.addInterval)
  addInterval(ctx: Scenes.SceneContext) {
    if (ctx?.callbackQuery?.message?.message_id) {
      ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    }
    ctx.reply(`Придумайте название интервала`, AbortMarkup);
    ctx.scene.enter(WIZARDS.addInterval);
  }

  @Action(ACTIONS.deleteInterval)
  deleteInterval(ctx: Scenes.SceneContext) {
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    ctx.scene.enter(WIZARDS.deleteInterval);
  }
}
