import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentesService } from './ventes.service';
import { VentesController } from './ventes.controller';

import { Vente } from './entities/vente.entity';
import { VenteLigne } from './entities/vente-ligne.entity';
import { Paiement } from './entities/paiement.entity';
import { FicheTechnique } from '../fiches-techniques/entities/fiches-technique.entity';
import { SessionCaisse } from '../sessions-caisse/entities/sessions-caisse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vente,
      VenteLigne,
      Paiement,
      FicheTechnique,
      SessionCaisse
    ]),
  ],
  controllers: [VentesController],
  providers: [VentesService],
})
export class VentesModule {}