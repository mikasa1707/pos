import { PartialType } from '@nestjs/mapped-types';
import { CreateLivraisonDto } from './create-livraison.dto';

export class UpdateLivraisonDto extends PartialType(CreateLivraisonDto) {}
