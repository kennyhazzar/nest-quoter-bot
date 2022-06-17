import { SchedulerRegistry } from '@nestjs/schedule';
import { Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { ACTIONS } from 'src/constants/ACTIONS';
import { COMMANDS } from 'src/constants/COMMANDS';
import { WIZARDS } from 'src/constants/WIZARDS';
import { CronsService } from 'src/crons/crons.service';
import { Markup, Scenes } from 'telegraf';

@Wizard(WIZARDS.addInterval)
export class AddIntervalWizard {
  private intervalState = {
    name: null,
    time: null,
  };

  constructor(
    private cronsService: CronsService,
    private schedulerRegisty: SchedulerRegistry,
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
    this.cronsService.addInterval(
      this.intervalState.name,
      this.intervalState.time,
      ctx.chat.id,
    );
    await ctx.replyWithMarkdown(
      `Интервал \`${this.intervalState.name}\` на ${
        this.intervalState.time / 3600000
      } часов добавлен!`,
      {
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [{ text: 'Меню интервалов', callback_data: ACTIONS.menuInterval }],
          ],
        },
      },
    );
    await ctx.scene.leave();
  }
}
