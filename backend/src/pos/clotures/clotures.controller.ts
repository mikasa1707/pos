import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CloturesService } from './clotures.service';
import { CreateClotureDto } from './dto/create-cloture.dto';
import { UpdateClotureDto } from './dto/update-cloture.dto';

@Controller('clotures')
export class CloturesController {
  constructor(private readonly cloturesService: CloturesService) {}

  @Post()
  create(@Body() createClotureDto: CreateClotureDto) {
    return this.cloturesService.create(createClotureDto);
  }

  @Get()
  findAll() {
    return this.cloturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cloturesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClotureDto: UpdateClotureDto) {
    return this.cloturesService.update(+id, updateClotureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cloturesService.remove(+id);
  }
}
