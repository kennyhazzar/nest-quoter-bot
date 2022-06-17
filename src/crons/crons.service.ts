import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import { GoogleService } from 'src/google/google.service';
import { getRandomInArray } from 'src/utils/random';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class CronsService {
  constructor(
    private schedulerRegisty: SchedulerRegistry,
    private readonly googleService: GoogleService,
    @InjectBot() private bot: Telegraf<Context>,
  ) {}

  async addInterval(name: string, milliseconds: number, userId: number) {
    const sendQuoteCallback = async () => {
      await this.googleService.actualizeSpreadsheet();
      const lists = this.googleService.getSpreadsheetTitlesOfLists();

      const { values: range } = await this.googleService.getCellByRange(
        `'${lists[getRandomInArray(lists)]}'!A:ZZ`,
      );

      const randomRange = range[getRandomInArray(range)].filter(
        (item) => item !== '',
      );
      const quote = randomRange[getRandomInArray(randomRange)];

      if (!quote) {
        this.bot.telegram.sendMessage(
          userId,
          'Кажется, найденная сейчас рандомом цитата сломана, попробуем отправить лучше в следующий раз',
          {
            reply_markup: {
              remove_keyboard: true,
            },
          },
        );
      }

      this.bot.telegram.sendMessage(userId, quote, {
        reply_markup: { remove_keyboard: true },
      });
    };

    const interval = setInterval(sendQuoteCallback, milliseconds);
    this.schedulerRegisty.addInterval(name, interval);
  }

  deleteInterval(name: string) {
    this.schedulerRegisty.deleteInterval(name);
  }

  getIntervals() {
    const intervals = this.schedulerRegisty.getIntervals();
    console.log(intervals);
    return intervals ? intervals : null;
  }
}
