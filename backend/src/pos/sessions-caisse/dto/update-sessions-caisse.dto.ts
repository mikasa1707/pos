import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionsCaisseDto } from './create-sessions-caisse.dto';

export class UpdateSessionsCaisseDto extends PartialType(CreateSessionsCaisseDto) {}
