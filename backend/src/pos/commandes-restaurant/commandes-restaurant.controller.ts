import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandesRestaurantService } from './commandes-restaurant.service';

@Controller('pos/commandes-restaurant')
export class CommandesRestaurantController {
  constructor(private readonly service: CommandesRestaurantService) {}

  @Get('ouvertes')
  findOuvertes() {
    return this.service.findOuvertes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post('ouvrir')
  ouvrir(@Body() body: any) {
    return this.service.ouvrir(body);
  }

  @Post(':id/lignes')
  ajouterLigne(@Param('id') id: string, @Body() body: any) {
    return this.service.ajouterLigne(+id, body);
  }

  @Patch('lignes/:ligneId/quantite')
  changerQuantiteLigne(
    @Param('ligneId') ligneId: string,
    @Body('quantite') quantite: number,
  ) {
    return this.service.changerQuantiteLigne(+ligneId, Number(quantite));
  }

  @Patch(':id/envoyer-preparation')
  envoyerPreparation(@Param('id') id: string) {
    return this.service.envoyerPreparation(+id);
  }

  @Patch(':id/servie')
  marquerServie(@Param('id') id: string) {
    return this.service.marquerServie(+id);
  }

  @Patch(':id/transferer-table')
  transfererTable(@Param('id') id: string, @Body('table_id') tableId: number) {
    return this.service.transfererTable(+id, Number(tableId));
  }

  @Patch(':id/fusionner')
  fusionner(
    @Param('id') id: string,
    @Body('commande_cible_id') cibleId: number,
  ) {
    return this.service.fusionner(+id, Number(cibleId));
  }

  @Patch(':id/annuler')
  annuler(@Param('id') id: string, @Body() body: { code_admin?: string }) {
    return this.service.annuler(+id, body);
  }

  @Post(':id/payer')
  payer(@Param('id') id: string, @Body() body: any) {
    return this.service.payer(+id, body);
  }
}
