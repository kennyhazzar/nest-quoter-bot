import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class CronsService {
  constructor(
    private schedulerRegisty: SchedulerRegistry,
    @InjectBot() private bot: Telegraf<Context>,
  ) {}

  addInterval(name: string, milliseconds: number, userId: number) {
    const testCallback = () => {
      this.bot.telegram.sendMessage(
        userId,
        `Interval ${name} executing at time (${milliseconds})`,
      );
    };

    const interval = setInterval(testCallback, milliseconds);
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
