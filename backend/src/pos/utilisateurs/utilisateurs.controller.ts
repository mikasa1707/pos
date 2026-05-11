import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { UtilisateursService } from './utilisateurs.service';

@Controller('pos/utilisateurs')
export class UtilisateursController {
  constructor(private readonly service: UtilisateursService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}