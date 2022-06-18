import { SchedulerRegistry } from '@nestjs/schedule';
import { Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { COMMANDS } from 'src/constants/COMMANDS';
import { MenuIntervalMarkup } from 'src/constants/keyboards/menu-interval-markup.keyboard';
import { WIZARDS } from 'src/constants/WIZARDS';
import { CronsService } from 'src/crons/crons.service';
import { GoogleService } from 'src/google/google.service';
import { Markup, Scenes } from 'telegraf';

@Wizard(WIZARDS.addInterval)
export class AddIntervalWizard {
  private intervalState = {
    name: null,
    time: null,
  };

  constructor(
    private readonly cronsService: CronsService,
    private schedulerRegisty: SchedulerRegistry,
    private readonly googleService: GoogleService,
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

    try {
      const interval = this.schedulerRegisty.getInterval(intervalName);
      if (interval) {
        ctx.reply(
          'Кажется, интервал с таким названием уже есть. Попробуйте другое название',
          Markup.removeKeyboard(),
        );
        ctx.scene.leave();
        return;
      }
    } catch (error) {
      this.intervalState.name = intervalName;
    }
    ctx.wizard.next();
    ctx.reply('Отправьте интервал в часах, в которые хотите получать цитаты');
    return;
  }

  @WizardStep(2)
  @On('text')
  async addIntervalTime(@Context() ctx: Scenes.WizardContext) {
    const intervalTime = (ctx as any).message.text as number;
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
      )}`,
    );
    ctx.wizard.next();
  }

  @WizardStep(3)
  @On('text')
  async addList(@Context() ctx: Scenes.WizardContext) {
    this.cronsService.addInterval(
      this.intervalState.name,
      this.intervalState.time,
      ctx.chat.id,
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
