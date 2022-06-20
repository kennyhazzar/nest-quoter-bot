import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { COMMANDS } from 'src/constants/COMMANDS';
import { MenuIntervalMarkup } from 'src/constants/keyboards/menu-interval-markup.keyboard';
import { WIZARDS } from 'src/constants/WIZARDS';
import { CronsService } from 'src/crons/crons.service';
import { GoogleService } from 'src/google/google.service';
import { IIntervalState } from 'src/interfaces/interval-state.interface';
import { IntervalDocument } from 'src/schemas/interval.schema';
import { Markup, Scenes } from 'telegraf';

@Wizard(WIZARDS.addInterval)
export class AddIntervalWizard {
  private intervalState: IIntervalState = {
    name: null,
    time: null,
    list: null,
    userId: null,
  };

  constructor(
    private readonly cronsService: CronsService,
    private readonly googleService: GoogleService,
    @InjectModel(IIntervalState.name)
    private IntervalModel: Model<IntervalDocument>,
  ) {}

  @WizardStep(1)
  @On('text')
  async storeIntervalName(@Context() ctx: Scenes.WizardContext) {
    const intervalName = (ctx as any).message.text as string;

    if (intervalName === 'Прервать') {
      await ctx.reply('Добавление интервала прервано', Markup.removeKeyboard());
      ctx.scene.leave();
      return;
    }

    const interval = await this.IntervalModel.findOne({ name: intervalName });

    if (interval) {
      ctx.reply(
        'Кажется, интервал с таким названием уже есть. Попробуйте другое название',
        Markup.removeKeyboard(),
      );
      ctx.scene.leave();
      return;
    }

    this.intervalState.name = intervalName;
    this.intervalState.userId = ctx.chat.id;

    ctx.wizard.next();
    ctx.reply('Отправьте интервал в часах, в которые хотите получать цитаты');
    return;
  }

  @WizardStep(2)
  @On('text')
  async addIntervalTime(@Context() ctx: Scenes.WizardContext) {
    const intervalTime = (ctx as any).message.text;
    if (intervalTime === 'Прервать') {
      await ctx.reply('Добавление интервала прервано', Markup.removeKeyboard());
      ctx.scene.leave();
      return;
    }

    intervalTime as number;

    if (intervalTime === NaN) {
      ctx.reply(
        `Кажется, это не число, попробуйте еще раз! ${COMMANDS.addInterval}`,
        Markup.removeKeyboard(),
      );
      ctx.scene.leave();
      return;
    }

    this.intervalState.time = intervalTime * 3600000;

    await this.googleService.actualizeSpreadsheet();
    const lists = this.googleService.getSpreadsheetTitlesOfLists();

    await ctx.replyWithMarkdown(
      `Отправьте лист, с которого хотите получать цитаты: ${lists.map(
        (list, index) => '\n' + `${index + 1}. \`${list}\``,
      )}\nЕсли вы хотите получать цитаты со всех листов, напишите \`all\``,
      {
        reply_markup: {
          keyboard: [...lists.map((list) => [list]), ['all'], ['Прервать']],
          resize_keyboard: true,
        },
      },
    );
    ctx.wizard.next();
  }

  @WizardStep(3)
  @On('text')
  async addList(@Context() ctx: Scenes.WizardContext) {
    const intervalList = (ctx as any).message.text as string;

    if (intervalList === 'Прервать') {
      await ctx.reply('Добавление интервала прервано', Markup.removeKeyboard());
      ctx.scene.leave();
      return;
    }

    const lists = this.googleService.getSpreadsheetTitlesOfLists();

    if (![...lists, 'all'].includes(intervalList)) {
      await ctx.replyWithMarkdown(
        `Кажется, такого листа в вашей таблице нет. Попробуйте еще раз!\nОтправьте лист, с которого хотите получать цитаты: ${lists.map(
          (list, index) => '\n' + `${index + 1}. \`${list}\``,
        )}\nЕсли вы хотите получать цитаты со всех листов, напишите \`all\``,
        {
          reply_markup: {
            keyboard: [...lists.map((list) => [list]), ['all'], ['Прервать']],
            resize_keyboard: true,
          },
        },
      );
      ctx.wizard.selectStep(2);
      return;
    }

    this.intervalState.list = intervalList;

    this.cronsService.addInterval(
      this.intervalState.name,
      this.intervalState.time,
      ctx.chat.id,
      this.intervalState.list,
    );
    await ctx.replyWithMarkdown(
      `Интервал \`${this.intervalState.name}\` на ${
        this.intervalState.time / 3600000
      } часов добавлен!`,
      MenuIntervalMarkup(),
    );
    await ctx.scene.leave();
  }
}
