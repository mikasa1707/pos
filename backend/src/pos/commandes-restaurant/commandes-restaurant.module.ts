import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandesRestaurantService } from './commandes-restaurant.service';
import { CommandesRestaurantController } from './commandes-restaurant.controller';

import { CommandeRestaurant } from './entities/commandes-restaurant.entity';
import { CommandeLigne } from './entities/commandes-lignes.entity';
import { TableRestaurant } from '../tables-restaurant/entities/tables-restaurant.entity';
import { FicheTechnique } from '../fiches-techniques/entities/fiches-technique.entity';
import { SessionCaisse } from '../sessions-caisse/entities/sessions-caisse.entity';
import { Vente } from '../ventes/entities/vente.entity';
import { VenteLigne } from '../ventes/entities/vente-ligne.entity';
import { Paiement } from '../ventes/entities/paiement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommandeRestaurant,
      CommandeLigne,
      TableRestaurant,
      FicheTechnique,
      SessionCaisse,
      Vente,
      VenteLigne,
      Paiement,
    ]),
  ],
  controllers: [CommandesRestaurantController],
  providers: [CommandesRestaurantService],
})
export class CommandesRestaurantModule {}