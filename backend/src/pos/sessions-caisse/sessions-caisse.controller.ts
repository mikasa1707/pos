import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { SessionsCaisseService } from './sessions-caisse.service';
import type  { Response } from 'express';

@Controller('pos/sessions-caisse')
export class SessionsCaisseController {
  constructor(private readonly service: SessionsCaisseService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('derniere-cloture')
  getDerniereCloture(@Query('utilisateur_id') utilisateurId: string) {
    return this.service.getDerniereCloture(+utilisateurId);
  }

  @Get('ouverte')
  getOuverte(@Query('utilisateur_id') utilisateurId: string) {
    return this.service.getOuverte(+utilisateurId);
  }

  @Post('ouvrir')
  ouvrir(@Body() body: { utilisateur_id: number; fond_caisse: number; poste_caisse_id: number; }) {
    return this.service.ouvrir(body);
  }

  @Post(':id/cloturer')
  cloturer(
    @Param('id') id: string,
    @Body() body: { montant_reel: number; commentaire?: string },
  ) {
    return this.service.cloturer(+id, body);
  }

  @Get(':id/rapport-json')
  rapportJson(@Param('id') id: string) {
    return this.service.rapport(+id);
  }

  @Get(':id/rapport-excel')
  async rapportExcel(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.service.rapportExcel(+id);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=rapport-caisse-${id}.xlsx`,
    );

    res.send(buffer);
  }
}
