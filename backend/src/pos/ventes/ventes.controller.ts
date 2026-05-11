import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VentesService } from './ventes.service';
import { CreateVenteDto } from './dto/create-vente.dto';

@Controller('pos/ventes')
export class VentesController {
  constructor(private readonly ventesService: VentesService) {}

  @Post()
  create(@Body() createVenteDto: CreateVenteDto) {
    return this.ventesService.create(createVenteDto);
  }

  @Get()
  findAll() {
    return this.ventesService.findAll();
  }
  
  @Get('historique')
  historique(
    @Query('session_caisse_id') sessionId?: string,
    @Query('date') date?: string,
  ) {
    return this.ventesService.historique({
      session_caisse_id: sessionId ? Number(sessionId) : undefined,
      date,
    });
  }

  @Get('dashboard')
  dashboard() {
    return this.ventesService.dashboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const idNumber = Number(id);

    if (isNaN(idNumber)) {
      throw new BadRequestException('ID invalide' + id);
    }

    return this.ventesService.findOne(idNumber);
  }

  @Patch(':id/annuler')
  annuler(@Param('id') id: string, @Body('commentaire') commentaire?: string) {
    return this.ventesService.annuler(+id, commentaire);
  }

}
