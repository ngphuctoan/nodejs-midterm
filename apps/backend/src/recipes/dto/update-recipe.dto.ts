import {
  IsBoolean,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRecipeInfoDto } from '../../dto/update-recipe-info.dto';

export class UpdateRecipeDto {
  @ValidateNested()
  @Type(() => UpdateRecipeInfoDto)
  info?: UpdateRecipeInfoDto;

  @IsOptional()
  @IsDateString()
  reminder?: string;

  @IsOptional()
  @IsBoolean()
  is_done?: boolean;
}
