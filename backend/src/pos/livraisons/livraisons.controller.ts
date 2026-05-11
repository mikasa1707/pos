import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LivraisonsService } from './livraisons.service';
import { CreateLivraisonDto } from './dto/create-livraison.dto';
import { UpdateLivraisonDto } from './dto/update-livraison.dto';

@Controller('livraisons')
export class LivraisonsController {
  constructor(private readonly livraisonsService: LivraisonsService) {}

  @Post()
  create(@Body() createLivraisonDto: CreateLivraisonDto) {
    return this.livraisonsService.create(createLivraisonDto);
  }

  @Get()
  findAll() {
    return this.livraisonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livraisonsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLivraisonDto: UpdateLivraisonDto) {
    return this.livraisonsService.update(+id, updateLivraisonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.livraisonsService.remove(+id);
  }
}
