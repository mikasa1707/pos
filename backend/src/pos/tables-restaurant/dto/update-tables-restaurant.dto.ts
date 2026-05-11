import { PartialType } from '@nestjs/mapped-types';
import { CreateTablesRestaurantDto } from './create-tables-restaurant.dto';

export class UpdateTablesRestaurantDto extends PartialType(CreateTablesRestaurantDto) {}
