import { IsOptional, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateRecipeInfoDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  @Transform(({ value }: { value?: string }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value?: string }) => value?.trim())
  content: string;
}
