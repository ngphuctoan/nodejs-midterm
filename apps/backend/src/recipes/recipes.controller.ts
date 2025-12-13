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
  ParseIntPipe,
  Delete,
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
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.recipesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.recipesService.findOne(req.user.id, id);
  }

  @Get(':id/image')
  async getImage(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const signedUrl = await this.recipesService.getImage(req.user.id, id);
    return signedUrl || 'https://placehold.co/300x300';
  }

  @Post()
  create(@Req() req: Request, @Body() createRecipeDto: CreateRecipeDto) {
    return this.recipesService.create(req.user.id, createRecipeDto);
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
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.recipesService.uploadImage(req.user.id, id, image);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.update(req.user.id, id, updateRecipeDto);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.recipesService.delete(req.user.id, id);
  }
}
