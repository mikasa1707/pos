import { PartialType } from '@nestjs/mapped-types';
import { CreateClotureDto } from './create-cloture.dto';

export class UpdateClotureDto extends PartialType(CreateClotureDto) {}
