import axios from 'axios';
import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { GoogleService } from 'src/google/google.service';
import { Markup, Scenes } from 'telegraf';

@Wizard('add-sheet')
export class AddSheetWizard {
  constructor(private readonly googleService: GoogleService) {}

  @WizardStep(1)
  startAddingSheet(@Context() ctx: Scenes.WizardContext) {
    ctx.reply(
      'Отправь мне id google таблицы. Пример:\nhttps://docs.google.com/spreadsheets/d/`sheet-id`/edit\n\nГде sheet-id - id твоей таблицы',
    );
  }

  @WizardStep(2)
  async addSheet(@Context() ctx: Scenes.WizardContext) {
    try {
      const link = (ctx as any).message.text as string;

      if (link === 'Прервать') {
        await ctx.reply('Добавление таблицы прервано', Markup.removeKeyboard());
      }

      const { message_id } = await ctx.reply(
        'Добавляем...',
        Markup.removeKeyboard(),
      );

      // const result = await axios.get('/')
    } catch (error) {}
  }
}
