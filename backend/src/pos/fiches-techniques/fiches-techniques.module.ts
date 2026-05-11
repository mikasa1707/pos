import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FichesTechniquesService } from './fiches-techniques.service';
import { FichesTechniquesController } from './fiches-techniques.controller';
import { FicheTechnique } from './entities/fiches-technique.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FicheTechnique, Category])],
  controllers: [FichesTechniquesController],
  providers: [FichesTechniquesService],
  exports: [FichesTechniquesService],
})
export class FichesTechniquesModule {}