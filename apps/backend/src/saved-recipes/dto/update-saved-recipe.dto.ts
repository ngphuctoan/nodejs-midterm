import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRecipeInfoDto } from '../../dto/update-recipe-info.dto';

export class UpdateSavedRecipeDto {
  @ValidateNested()
  @Type(() => UpdateRecipeInfoDto)
  info?: UpdateRecipeInfoDto;
}
