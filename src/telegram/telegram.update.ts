import axios from 'axios';
import { Command, Start, Update } from 'nestjs-telegraf';
import { SpreadsheetInformationDto } from 'src/google/dto/spreadsheet.dto';
import { GoogleService } from 'src/google/google.service';
import { Context } from 'telegraf';

@Update()
export class TelegramUpdate {
  constructor(private readonly googleService: GoogleService) {}
  @Start()
  startCommand(ctx: Context) {
    ctx.reply('Первый привет из этого болота');
  }

  @Command('sheet')
  sheetCommand(ctx: Context) {
    ctx.reply(
      'Информация про таблицу. Сколько цитат, какие имеются листы,' +
        ' ссылка на таблицу и кнопка добавления новой или замена текущей',
    );
  }

  @Command('schedule')
  scheduleCommand(ctx: Context) {
    ctx.reply(
      'Просмотр информации по текущему расписанию. Добавление и удаление ремайндеров',
    );
  }

  @Command('test')
  async testAxios(ctx: Context) {
    const { data } = await axios.post<SpreadsheetInformationDto>(
      '/google/add-sheet',
    );
  }
}
