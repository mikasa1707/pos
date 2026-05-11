import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LivreursService } from './livreurs.service';
import { CreateLivreurDto } from './dto/create-livreur.dto';
import { UpdateLivreurDto } from './dto/update-livreur.dto';

@Controller('livreurs')
export class LivreursController {
  constructor(private readonly livreursService: LivreursService) {}

  @Post()
  create(@Body() createLivreurDto: CreateLivreurDto) {
    return this.livreursService.create(createLivreurDto);
  }

  @Get()
  findAll() {
    return this.livreursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livreursService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLivreurDto: UpdateLivreurDto) {
    return this.livreursService.update(+id, updateLivreurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.livreursService.remove(+id);
  }
}
