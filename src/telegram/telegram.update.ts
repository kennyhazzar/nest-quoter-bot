import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Action, Command, Start, Update } from 'nestjs-telegraf';
import {
  AddSpreadsheetMarkup,
  DeleteIntervalMarkup,
  MenuIntervalMarkup,
  ScheduleCommandMarkup,
  ShowInformationMarkup,
  WIZARDS,
  ACTIONS,
  COMMANDS,
  AbortMarkup,
} from 'src/constants';
import { GoogleService } from 'src/google/google.service';
import { IIntervalState } from 'src/interfaces';
import { IntervalDocument } from 'src/schemas';
import { Context, Markup, Scenes } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(
    private readonly googleService: GoogleService,
    private schedulerRegisty: SchedulerRegistry,
    @InjectModel(IIntervalState.name)
    private IntervalModel: Model<IntervalDocument>,
  ) {}

  @Start()
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
        'Кажется, вы еще не добавили таблицу с цитатами.',
        AddSpreadsheetMarkup(),
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

    const lists = this.googleService.getSpreadsheetTitlesOfLists();

    ctx.reply(
      `Таблица: \`${sheet.title}\`\nСтраницы:${lists.map(
        (list) => ` \`${list}\` `,
      )}\nКоличество цитат: \`${quoterCount}\``,
      ShowInformationMarkup(sheet),
    );
  }

  @Command(COMMANDS.schedule)
  @Action(ACTIONS.menuInterval)
  scheduleCommand(ctx: Context) {
    if (ctx?.callbackQuery?.message?.message_id) {
      ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    }

    if (!this.googleService.spreadsheetInfo) {
      ctx.reply(
        'Чтобы просматривать информацию про расписание, следует добавить таблицу. Добавьте здесь: /add',
        Markup.removeKeyboard(),
      );
      return;
    }

    ctx.reply(
      'Просмотр информации по текущему расписанию. Добавление и удаление интервалов',
      ScheduleCommandMarkup(),
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
        'Таблица успешно удалена из базы данных. А также удалены все интервалы.',
        AddSpreadsheetMarkup(),
      );
    } catch (error) {
      console.log(error);
      ctx.deleteMessage(message_id);
      ctx.reply('Похоже, в моих чертогах произошел сбой...Спрос c разраба');
    }
  }

  @Action(ACTIONS.intervalList)
  async getListInterval(ctx: Context) {
    ctx.deleteMessage();

    if (!this.googleService.spreadsheetInfo) {
      ctx.reply(
        'Чтобы просматривать информацию про расписание, следует добавить таблицу.',
        AddSpreadsheetMarkup(),
      );
      return;
    }

    const intervals = await this.IntervalModel.find({});
    await ctx.replyWithMarkdown(
      'Имя, время, лист:\n' +
        `${
          intervals.length != 0
            ? intervals.map(
                (interval, index) =>
                  '\n' +
                  `${index + 1}. \`${interval.name}\` | раз в ${
                    interval.time / 3600000
                  } часов | \`${interval.list}\``,
              )
            : '**У вас пока нету интервалов**'
        }`,
      MenuIntervalMarkup(),
    );
  }

  @Command(COMMANDS.addInterval)
  @Action(ACTIONS.addInterval)
  addInterval(ctx: Scenes.SceneContext) {
    if (ctx?.callbackQuery?.message?.message_id) {
      ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    }

    if (!this.googleService.spreadsheetInfo) {
      ctx.reply(
        'Чтобы добавлять интервалы, следует добавить таблицу.',
        AddSpreadsheetMarkup(),
      );
      return;
    }

    ctx.reply(`Придумайте название интервала`, AbortMarkup);
    ctx.scene.enter(WIZARDS.addInterval);
  }

  @Action(ACTIONS.deleteInterval)
  deleteInterval(ctx: Scenes.SceneContext) {
    ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    if (!this.googleService.spreadsheetInfo) {
      ctx.reply(
        'Чтобы удалять интервалы, следует добавить таблицу.',
        AddSpreadsheetMarkup(),
      );
      return;
    }

    const intervals = this.schedulerRegisty.getIntervals();

    if (intervals.length === 0) {
      ctx.reply(
        'Кажется, у вас нету интервалов на удаление',
        DeleteIntervalMarkup(),
      );

      return;
    }

    ctx.scene.enter(WIZARDS.deleteInterval);
  }
}
