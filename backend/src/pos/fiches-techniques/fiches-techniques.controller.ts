import { FichesTechniquesService } from './fiches-techniques.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('pos/fiches-techniques')
export class FichesTechniquesController {
  constructor(private readonly service: FichesTechniquesService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    if (q) {
      return this.service.search(q);
    }

    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(+id, body);
  }
}
