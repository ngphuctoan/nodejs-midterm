import { IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecipeInfoDto } from '../../dto/create-recipe-info.dto';

export class CreateSavedRecipeDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateRecipeInfoDto)
  info: CreateRecipeInfoDto;
}
