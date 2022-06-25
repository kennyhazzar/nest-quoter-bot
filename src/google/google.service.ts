import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { SpreadsheetDocument } from 'src/schemas';
import {
  CellsRangeDto,
  GetAccessTokenDto,
  SpreadsheetInformationDto,
  SpreadsheetInformationResponseDto,
} from './dto';

@Injectable()
export class GoogleService {
  private expiresIn: number;
  private updateTokenTimestamp: number;
  spreadsheetInfo: SpreadsheetInformationDto;
  private accessToken: string;
  private api: AxiosInstance;
  constructor(
    @InjectModel(SpreadsheetInformationDto.name)
    private SpreadsheetModel: Model<SpreadsheetDocument>,
  ) {
    this.api = axios.create();
    this.api.interceptors.request.use(async (config) => {
      if (Date.now() - this.updateTokenTimestamp > this.expiresIn) {
        await this.updateAccessToken();
      }
      config.headers['Authorization'] = `Bearer ${this.accessToken}`;
      return config;
    });
    this.updateAccessToken();
    this.getCurrentSpreadsheet();
  }

  async updateAccessToken(): Promise<void> {
    try {
      const { data } = await axios.post<GetAccessTokenDto>(
        `${process.env.GOOGLE_AUTH_URI}`,
        {
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: process.env.REFRESH_TOKEN,
        },
      );
      this.accessToken = data.access_token;
      this.updateTokenTimestamp = Date.now();
      this.expiresIn = data.expires_in * 1000;
    } catch (error) {
      console.log(error);
    }
  }

  async getCurrentSpreadsheet(): Promise<SpreadsheetInformationDto> {
    const sheet = await this.SpreadsheetModel.find();
    this.spreadsheetInfo = sheet[0];
    return sheet ? sheet[0] : null;
  }

  async actualizeSpreadsheet(): Promise<void> {
    const sheet = await this.getCurrentSpreadsheet();
    try {
      const actualized = await this.getSpreadsheetInformationById(
        sheet.spreadsheetId,
      );
      this.spreadsheetInfo = actualized;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          result: 'error',
          error: 'this spreadsheet is not exist',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async addSpreadsheet(id: string): Promise<SpreadsheetInformationDto> {
    const [sheets, newSheet] = await Promise.all([
      this.SpreadsheetModel.find().exec(),
      this.getSpreadsheetInformationById(id),
    ]);

    try {
      if (sheets) {
        await this.SpreadsheetModel.deleteMany({});
        this.createSheet(newSheet);
        return newSheet;
      }

      await this.createSheet(newSheet);
      this.spreadsheetInfo = newSheet;
      return newSheet;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          result: 'error',
          error: 'this spreadsheet is not exist',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private async createSheet(
    sheetDto: SpreadsheetInformationDto,
  ): Promise<void> {
    try {
      const sheet = await this.SpreadsheetModel.create(sheetDto);
      sheet.save();
    } catch (error) {
      console.log(error);
    }
  }

  private async getSpreadsheetInformationById(
    id: string,
  ): Promise<SpreadsheetInformationDto> {
    try {
      const {
        data: {
          properties: { title, locale, autoRecalc, timeZone },
          sheets,
          spreadsheetUrl,
        },
      } = await this.api.get<SpreadsheetInformationResponseDto>(
        `${process.env.GOOGLE_API_URI}${id}`,
      );
      return {
        title,
        locale,
        autoRecalc,
        timeZone,
        sheets,
        spreadsheetUrl,
        spreadsheetId: id,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          result: 'error',
          error: 'this spreadsheet is not exist',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getCellByRange(range = 'A:ZZ'): Promise<CellsRangeDto> {
    const { data } = await this.api.get<CellsRangeDto>(
      encodeURI(
        `${process.env.GOOGLE_API_URI}${this.spreadsheetInfo.spreadsheetId}/values/${range}`,
      ),
    );
    return data;
  }

  getSpreadsheetTitlesOfLists() {
    const lists = this.spreadsheetInfo.sheets.map(
      (sheet) => sheet.properties.title,
    );
    return lists ? lists : null;
  }

  async deleteSpreadsheet() {
    try {
      const deleted = await this.SpreadsheetModel.deleteOne({
        id: this.spreadsheetInfo.spreadsheetId,
      });

      if (!deleted.acknowledged) {
        return null;
      }

      this.spreadsheetInfo = null;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        { result: 'error', error: 'something wrong in code ^^' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCount(): Promise<number> {
    let count = 0;

    await this.actualizeSpreadsheet();
    const lists = this.getSpreadsheetTitlesOfLists();

    for (let index = 0; index < lists.length; index++) {
      const list = lists[index];

      const { values } = await this.getCellByRange(`'${list}'!A:ZZ`);
      for (let index = 0; index < values.length; index++) {
        const value = values[index].filter((item) => item !== '');
        count += value.length;
      }
    }

    return count;
  }
}
