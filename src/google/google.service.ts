import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { CellsRangeDto } from './dto/cells-range.dto';
import { GetAccessTokenDto } from './dto/get-access-token.dto';

@Injectable()
export class GoogleService {
    private accessToken: string;
    private api: AxiosInstance
    constructor() {
        if (!this.accessToken) {
            this.updateAccessToken()
        }
        this.api = axios.create()
        this.api.interceptors.request.use((config) => {
            config.headers['Authorization'] = `Bearer ${this.accessToken}`;

            return config
        })
    }

    private async updateAccessToken() {
        try {
            const { data } = await axios.post<GetAccessTokenDto>(`https://oauth2.googleapis.com/token`, {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: process.env.REFRESH_TOKEN
            })

            this.accessToken = data.access_token
        } catch (error) {
            console.log((error as AxiosError).response.data)
        }
    }
    async getCell(spreadsheetId: string, range: string): Promise<AxiosResponse<CellsRangeDto>> {
        return this.api.get<CellsRangeDto>(encodeURI(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`))
    }
}
