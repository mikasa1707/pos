import { Module } from '@nestjs/common';
import { SyncGestionStockService } from './sync-gestion-stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionCaisse } from '../sessions-caisse/entities/sessions-caisse.entity';
import { Vente } from '../ventes/entities/vente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SessionCaisse, Vente])],

  providers: [SyncGestionStockService],

  exports: [SyncGestionStockService],
})
export class SyncGestionStockModule {}
