import { Module } from '@nestjs/common';
import { CaissiersService } from './caissiers.service';
import { CaissiersController } from './caissiers.controller';

@Module({
  controllers: [CaissiersController],
  providers: [CaissiersService],
})
export class CaissiersModule {}
