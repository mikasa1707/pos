import { PartialType } from '@nestjs/mapped-types';
import { CreateCaissierDto } from './create-caissier.dto';

export class UpdateCaissierDto extends PartialType(CreateCaissierDto) {}
