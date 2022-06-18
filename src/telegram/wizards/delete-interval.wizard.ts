import { SchedulerRegistry } from '@nestjs/schedule';
import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { AbortMarkup } from 'src/constants/AbortMarkup';
import { MenuIntervalMarkup } from 'src/constants/keyboards/menu-interval-markup.keyboard';
import { WIZARDS } from 'src/constants/WIZARDS';
import { CronsService } from 'src/crons/crons.service';
import { Markup, Scenes } from 'telegraf';

@Wizard(WIZARDS.deleteInterval)
export class DeleteIntervalWizard {
  constructor(
    private cronsService: CronsService,
    private schedulerRegisty: SchedulerRegistry,
  ) {}

  @WizardStep(1)
  addIntervalName(@Context() ctx: Scenes.WizardContext) {
    ctx.reply(`Введите название интервала`, AbortMarkup);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async storeIntervalName(@Context() ctx: Scenes.WizardContext) {
    const intervalName = (ctx as any).message.text as string;

    if (intervalName === 'Прервать') {
      await ctx.reply('Удаление интервала прервано', Markup.removeKeyboard());
      ctx.scene.leave();
      return;
    }

    try {
      this.schedulerRegisty.getInterval(intervalName);
      this.cronsService.deleteInterval(intervalName);
      await ctx.replyWithMarkdown(
        `Интервал \`${intervalName}\` удален успешно!`,
        MenuIntervalMarkup(),
      );
    } catch (error) {
      ctx.reply('Кажется, Такого интервала нету, попробуйте еще раз!');
      ctx.wizard.selectStep(1);
      return;
    }
    ctx.scene.leave();
  }
}
