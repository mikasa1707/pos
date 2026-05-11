import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VentesModule } from './pos/ventes/ventes.module';
import { PaiementsModule } from './pos/paiements/paiements.module';
import { CaissiersModule } from './pos/caissiers/caissiers.module';
import { LivreursModule } from './pos/livreurs/livreurs.module';
import { LivraisonsModule } from './pos/livraisons/livraisons.module';
import { CloturesModule } from './pos/clotures/clotures.module';
import { CategoriesModule } from './pos/categories/categories.module';
import { FichesTechniquesModule } from './pos/fiches-techniques/fiches-techniques.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UtilisateursModule } from './pos/utilisateurs/utilisateurs.module';
import { AuthModule } from './auth/auth.module';
import { SessionsCaisseModule } from './pos/sessions-caisse/sessions-caisse.module';
import { ZonesRestaurantModule } from './pos/zones-restaurant/zones-restaurant.module';
import { TablesRestaurantModule } from './pos/tables-restaurant/tables-restaurant.module';
import { CommandesRestaurantModule } from './pos/commandes-restaurant/commandes-restaurant.module';
import { SyncGestionStockService } from './pos/sync-gestion-stock/sync-gestion-stock.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    VentesModule,
    PaiementsModule,
    CaissiersModule,
    LivreursModule,
    LivraisonsModule,
    CloturesModule,
    CategoriesModule,
    FichesTechniquesModule,
    UtilisateursModule,
    AuthModule,
    SessionsCaisseModule,
    ZonesRestaurantModule,
    TablesRestaurantModule,
    CommandesRestaurantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
