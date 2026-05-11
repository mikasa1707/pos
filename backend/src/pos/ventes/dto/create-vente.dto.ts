import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ModePaiement,
  ModePaiementDetail,
} from '../enums/mode-paiement.enum';

class CreateVenteLigneDto {
  @IsNumber()
  fiche_technique_id!: number;

  @IsNumber()
  @Min(0.001)
  quantite!: number;
}

class CreatePaiementDto {
  @IsEnum(ModePaiementDetail)
  mode!: ModePaiementDetail;

  @IsNumber()
  @Min(0)
  montant!: number;

  @IsOptional()
  @IsString()
  reference_transaction?: string;
}

export class CreateVenteDto {
  @IsNumber()
  session_caisse_id!: number;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsString()
  commentaire?: string;

  @IsEnum(ModePaiement)
  mode_paiement!: ModePaiement;

  @IsNumber()
  @Min(0)
  montant_paye!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVenteLigneDto)
  lignes!: CreateVenteLigneDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaiementDto)
  paiements?: CreatePaiementDto[];
}