import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { StatusController } from './controllers/status.controller';
import { UserDataService } from './services/user-data.service';
import { BrowserPoolService } from './services/browser-pool.service';
import { TimezoneService } from './services/timezone.service';
import { CDPController } from './controllers/cdp.controller';

const USER_DATA_PROVIDERS = Object.keys(process.env).filter(k => k.startsWith('S3_')).length === 0 ? [] : [
  {
    provide: S3Client,
    useFactory: async () => {
      return new S3Client({
        region: 'auto',
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });
    }
  },

  UserDataService,
]

@Module({
  imports: [],
  controllers: [
    CDPController,
    StatusController,
  ],
  providers: [
    ...USER_DATA_PROVIDERS,
    BrowserPoolService,
    TimezoneService
  ],
})
export class AppModule { }
