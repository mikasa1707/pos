import { Module } from '@nestjs/common';
import { LivraisonsService } from './livraisons.service';
import { LivraisonsController } from './livraisons.controller';

@Module({
  controllers: [LivraisonsController],
  providers: [LivraisonsService],
})
export class LivraisonsModule {}
