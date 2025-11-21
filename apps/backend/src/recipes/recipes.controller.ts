import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipesController {
  constructor(private recipeService: RecipesService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.recipeService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: number) {
    return this.recipeService.findOne(req.user.id, id);
  }

  @Get(':id/image')
  async getImage(@Req() req: Request, @Param('id') id: number) {
    const signedUrl = await this.recipeService.getImage(req.user.id, id);
    return signedUrl || 'https://placehold.co/300x300';
  }

  @Post()
  create(@Req() req: Request, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipeService.create(req.user.id, createRecipeDto);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5_000_000 }),
          new FileTypeValidator({ fileType: '^image/\\w+$' }),
        ],
      }),
    )
    image: Express.Multer.File,
    @Req() req: Request,
    @Param('id') id: number,
  ) {
    return this.recipeService.uploadImage(req.user.id, id, image);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipeService.update(req.user.id, id, updateRecipeDto);
  }
}
