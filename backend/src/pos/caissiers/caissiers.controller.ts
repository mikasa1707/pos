import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CaissiersService } from './caissiers.service';
import { CreateCaissierDto } from './dto/create-caissier.dto';
import { UpdateCaissierDto } from './dto/update-caissier.dto';

@Controller('caissiers')
export class CaissiersController {
  constructor(private readonly caissiersService: CaissiersService) {}

  @Post()
  create(@Body() createCaissierDto: CreateCaissierDto) {
    return this.caissiersService.create(createCaissierDto);
  }

  @Get()
  findAll() {
    return this.caissiersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caissiersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCaissierDto: UpdateCaissierDto) {
    return this.caissiersService.update(+id, updateCaissierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.caissiersService.remove(+id);
  }
}
