import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { SpreadsheetDocument } from 'src/schemas/spreadsheet.schema';
import { CellsRangeDto } from './dto/cells-range.dto';
import { GetAccessTokenDto } from './dto/get-access-token.dto';
import {
  SpreadsheetInformationDto,
  SpreadsheetInformationResponseDto,
} from './dto/spreadsheet.dto';

@Injectable()
export class GoogleService {
  expiresIn: number;
  updateTokenTimestamp: number;
  private accessToken: string;
  private api: AxiosInstance;
  private spreadsheetInfo: SpreadsheetInformationDto;
  constructor(
    @InjectModel(SpreadsheetInformationDto.name)
    private SpreadsheetModel: Model<SpreadsheetDocument>,
  ) {
    this.api = axios.create();
    this.api.interceptors.request.use((config) => {
      config.headers['Authorization'] = `Bearer ${this.accessToken}`;

      return config;
    });
    this.updateAccessToken();
  }

  async updateAccessToken(): Promise<void> {
    try {
      const { data } = await axios.post<GetAccessTokenDto>(
        `https://oauth2.googleapis.com/token`,
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

  private async getCurrentSpreadsheet(id: string) {
    const sheet = await this.SpreadsheetModel.findOne({ spreadSheetId: id });
    if (!sheet) {
      return { result: false };
    }
    return sheet;
  }

  async addSpreadsheet(id?: string): Promise<SpreadsheetInformationDto> {
    const [sheets, newSheet] = await Promise.all([
      this.SpreadsheetModel.find().exec(),
      this.getSpreadsheetInformationById(id),
    ]);

    if (sheets) {
      await this.SpreadsheetModel.remove({});
      this.createSheet(newSheet);
      return newSheet;
    }

    this.createSheet(newSheet);
    return newSheet;
  }

  private async createSheet(
    sheetDto: SpreadsheetInformationDto,
  ): Promise<void> {
    const sheet = await this.SpreadsheetModel.create(sheetDto);
    sheet.save();
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
        `https://sheets.googleapis.com/v4/spreadsheets/${id}`,
      );
      return {
        title,
        locale,
        autoRecalc,
        timeZone,
        sheets,
        spreadsheetUrl,
        spreadSheetId: id,
      };
    } catch (error) {
      console.log((error as AxiosError).response.data);
    }
  }

  async getCellByRange(
    spreadsheetId: string,
    range = 'A:ZZ',
  ): Promise<CellsRangeDto> {
    const { data } = await this.api.get<CellsRangeDto>(
      encodeURI(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
      ),
    );
    return data;
  }

  getCurrentAccessToken(): string {
    return this.accessToken;
  }

  getUpdateTokenTimestamp(): number {
    return this.updateTokenTimestamp;
  }
}
