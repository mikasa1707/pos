import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZonesRestaurantService } from './zones-restaurant.service';
import { CreateZonesRestaurantDto } from './dto/create-zones-restaurant.dto';
import { UpdateZonesRestaurantDto } from './dto/update-zones-restaurant.dto';

@Controller('zones-restaurant')
export class ZonesRestaurantController {
  constructor(private readonly zonesRestaurantService: ZonesRestaurantService) {}

  @Post()
  create(@Body() createZonesRestaurantDto: CreateZonesRestaurantDto) {
    return this.zonesRestaurantService.create(createZonesRestaurantDto);
  }

  @Get()
  findAll() {
    return this.zonesRestaurantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonesRestaurantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZonesRestaurantDto: UpdateZonesRestaurantDto) {
    return this.zonesRestaurantService.update(+id, updateZonesRestaurantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zonesRestaurantService.remove(+id);
  }
}
