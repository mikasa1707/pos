import { PartialType } from '@nestjs/mapped-types';
import { CreateFichesTechniqueDto } from './create-fiches-technique.dto';

export class UpdateFichesTechniqueDto extends PartialType(CreateFichesTechniqueDto) {}
