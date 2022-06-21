import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { MenuIntervalMarkup } from 'src/constants/keyboards/menu-interval-markup.keyboard';
import { WIZARDS } from 'src/constants/WIZARDS';
import { CronsService } from 'src/crons/crons.service';
import { IIntervalState } from 'src/interfaces/interval-state.interface';
import { IntervalDocument } from 'src/schemas/interval.schema';
import { Scenes } from 'telegraf';

@Wizard(WIZARDS.deleteInterval)
export class DeleteIntervalWizard {
  constructor(
    private cronsService: CronsService,
    @InjectModel(IIntervalState.name)
    private IntervalModel: Model<IntervalDocument>,
  ) {}

  @WizardStep(1)
  async addIntervalName(@Context() ctx: Scenes.WizardContext) {
    const intervals = await this.IntervalModel.find({});
    await ctx.reply(`Введите название интервала`, {
      reply_markup: {
        keyboard: [...intervals.map(({ name }) => [name]), ['Прервать']],
        resize_keyboard: true,
      },
    });
    ctx.wizard.next();
  }

  @WizardStep(2)
  async storeIntervalName(@Context() ctx: Scenes.WizardContext) {
    const intervalName = (ctx as any).message.text as string;

    if (intervalName === 'Прервать') {
      await ctx.reply('Удаление интервала прервано', MenuIntervalMarkup());
      ctx.scene.leave();
      return;
    }

    const interval = this.IntervalModel.findOne({ name: intervalName });

    if (!interval) {
      ctx.reply('Кажется, такого интервала нету, попробуйте еще раз!');
      ctx.wizard.selectStep(1);
      return;
    }

    await this.cronsService.deleteInterval(intervalName);
    await ctx.replyWithMarkdown(
      `Интервал \`${intervalName}\` удален успешно!`,
      MenuIntervalMarkup(),
    );
    ctx.scene.leave();
  }
}
