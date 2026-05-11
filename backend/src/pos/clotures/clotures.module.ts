import { Module } from '@nestjs/common';
import { CloturesService } from './clotures.service';
import { CloturesController } from './clotures.controller';

@Module({
  controllers: [CloturesController],
  providers: [CloturesService],
})
export class CloturesModule {}
