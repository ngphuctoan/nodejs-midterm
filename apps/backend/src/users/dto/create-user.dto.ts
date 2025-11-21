import { IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @Length(1, 255)
  @Transform(({ value }: { value?: string }) => value?.trim())
  name: string;

  @IsString()
  @Length(1, 255)
  @Transform(({ value }: { value?: string }) => value?.trim())
  email: string;

  @IsString()
  @Length(6, 255)
  password: string;
}
