import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecipeInfoDto } from '../../dto/create-recipe-info.dto';

export class CreateRecipeDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateRecipeInfoDto)
  info: CreateRecipeInfoDto;

  @IsOptional()
  @IsDateString()
  reminder?: string;

  @IsOptional()
  @IsBoolean()
  is_done?: boolean;
}
