import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsCaisseService } from './sessions-caisse.service';
import { SessionsCaisseController } from './sessions-caisse.controller';
import { SessionCaisse } from './entities/sessions-caisse.entity';
import { Vente } from '../ventes/entities/vente.entity';
import { PosteCaisse } from '../sessions-caisse/entities/poste-caisse.entity';
import { SyncGestionStockModule } from '../sync-gestion-stock/sync-gestion-stock.module';

@Module({
  imports: [TypeOrmModule.forFeature([SessionCaisse, Vente, PosteCaisse]), SyncGestionStockModule,],
  controllers: [SessionsCaisseController],
  providers: [SessionsCaisseService],
})
export class SessionsCaisseModule {}