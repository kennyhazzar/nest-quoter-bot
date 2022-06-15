import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { AbortMarkup } from 'src/constants/AbortMarkup';
import { GoogleService } from 'src/google/google.service';
import { Markup, Scenes } from 'telegraf';

@Wizard('add-spreadsheet')
export class AddSheetWizard {
  constructor(private readonly googleService: GoogleService) {}

  @WizardStep(1)
  startAddingSheet(@Context() ctx: Scenes.WizardContext) {
    ctx.reply(
      'Отправь мне id google таблицы. Пример:\nhttps://docs.google.com/spreadsheets/d/`sheet-id`/edit\n\nГде sheet-id - id твоей таблицы',
      AbortMarkup,
    );
    ctx.wizard.next();
  }

  @WizardStep(2)
  async addSheet(@Context() ctx: Scenes.WizardContext) {
    try {
      const id = (ctx as any).message.text as string;

      if (id === 'Прервать') {
        await ctx.reply('Добавление таблицы прервано', Markup.removeKeyboard());
        return ctx.scene.leave();
      }

      const { message_id } = await ctx.reply(
        'Добавляем...',
        Markup.removeKeyboard(),
      );

      const result = await this.googleService.addSpreadsheet(id);

      ctx.deleteMessage(message_id);

      ctx.reply(`Таблица \`${result.title}\`добавлена успешно`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: result.title, url: result.spreadsheetUrl }],
          ],
        },
      });
      return ctx.scene.leave();
    } catch (error: any) {
      ctx.reply(
        `Что-то пошло не так. Ошибка:\n${error.response.error}`,
        Markup.removeKeyboard(),
      );
      ctx.scene.leave();
    }
  }
}
