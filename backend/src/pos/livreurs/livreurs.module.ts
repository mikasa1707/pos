import { Module } from '@nestjs/common';
import { LivreursService } from './livreurs.service';
import { LivreursController } from './livreurs.controller';

@Module({
  controllers: [LivreursController],
  providers: [LivreursService],
})
export class LivreursModule {}
