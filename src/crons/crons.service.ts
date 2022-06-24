import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectBot } from 'nestjs-telegraf';
import { GoogleService } from 'src/google/google.service';
import { IIntervalState } from 'src/interfaces';
import { IntervalDocument } from 'src/schemas';
import { getRandomInArray } from 'src/utils';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class CronsService implements OnApplicationBootstrap {
  constructor(
    private schedulerRegisty: SchedulerRegistry,
    private readonly googleService: GoogleService,
    @InjectBot() private bot: Telegraf<Context>,
    @InjectModel(IIntervalState.name)
    private IntervalModel: Model<IntervalDocument>,
  ) {}

  async activatedIntervals() {
    const intervals = await this.IntervalModel.find({});
    const intervalsFromSchedule = this.schedulerRegisty.getIntervals();

    if (intervals.length === 0) {
      return;
    }

    for (let index = 0; index < intervals.length; index++) {
      const interval = intervals[index];

      const sendQuoteCallback = async () => {
        const callBackIntervalName = interval.name;
        const [dbInterval] = await Promise.all([
          this.IntervalModel.findOne({ name: callBackIntervalName }),
          this.googleService.actualizeSpreadsheet(),
        ]);
        const lists = this.googleService.getSpreadsheetTitlesOfLists();

        if (![...lists, 'all'].includes(dbInterval.list)) {
          return;
        }

        const listString =
          dbInterval.list === 'all'
            ? lists[getRandomInArray(lists)]
            : dbInterval.list;

        const { values: range } = await this.googleService.getCellByRange(
          `'${listString}'!A:ZZ`,
        );

        const filteredRange = range.filter((range) => range.length !== 0);

        const randomRange = filteredRange[
          getRandomInArray(filteredRange)
        ].filter((item) => item !== '');

        const quote = randomRange[getRandomInArray(randomRange)];

        if (!quote) {
          this.bot.telegram.sendMessage(
            interval.userId,
            'Кажется, найденная сейчас рандомом цитата сломана, попробуем отправить лучше в следующий раз',
            {
              reply_markup: {
                remove_keyboard: true,
              },
            },
          );
        }

        this.bot.telegram.sendMessage(interval.userId, quote, {
          reply_markup: { remove_keyboard: true },
        });
      };

      try {
        if (!intervalsFromSchedule.includes(interval.name)) {
          const addIntervalResult = setInterval(
            sendQuoteCallback,
            interval.time,
          );
          this.schedulerRegisty.addInterval(interval.name, addIntervalResult);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async addInterval(
    name: string,
    milliseconds: number,
    userId: number,
    list: string,
  ) {
    new this.IntervalModel({
      name,
      time: milliseconds,
      list,
      userId,
    }).save();

    const sendQuoteCallback = async () => {
      const callBackIntervalName = name;
      const [dbInterval] = await Promise.all([
        this.IntervalModel.findOne({ name: callBackIntervalName }),
        this.googleService.actualizeSpreadsheet(),
      ]);
      const lists = this.googleService.getSpreadsheetTitlesOfLists();

      if (![...lists, 'all'].includes(dbInterval.list)) {
        return;
      }

      const listString =
        dbInterval.list === 'all'
          ? lists[getRandomInArray(lists)]
          : dbInterval.list;

      const { values: range } = await this.googleService.getCellByRange(
        `'${listString}'!A:ZZ`,
      );

      const filteredRange = range.filter((range) => range.length !== 0);

      const randomRange = filteredRange[getRandomInArray(filteredRange)].filter(
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

  async deleteInterval(name: string): Promise<void> {
    await this.IntervalModel.deleteOne({ name });
    this.schedulerRegisty.deleteInterval(name);
  }

  getIntervals() {
    const intervals = this.schedulerRegisty.getIntervals();
    return intervals ? intervals : null;
  }

  onApplicationBootstrap() {
    this.activatedIntervals();
  }
}
