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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavedRecipesService } from './saved-recipes.service';
import type { Request } from 'express';
import { CreateSavedRecipeDto } from './dto/create-saved-recipe.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateSavedRecipeDto } from './dto/update-saved-recipe.dto';

@Controller('saved-recipes')
@UseGuards(JwtAuthGuard)
export class SavedRecipesController {
  constructor(private readonly savedRecipesService: SavedRecipesService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.savedRecipesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.savedRecipesService.findOne(req.user.id, id);
  }

  @Get(':id/image')
  async getImage(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const signedUrl = await this.savedRecipesService.getImage(req.user.id, id);
    return signedUrl || 'https://placehold.co/300x300';
  }

  @Post()
  create(
    @Req() req: Request,
    @Body() createSavedRecipeDto: CreateSavedRecipeDto,
  ) {
    return this.savedRecipesService.create(req.user.id, createSavedRecipeDto);
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
    return this.savedRecipesService.uploadImage(req.user.id, id, image);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSavedRecipeDto: UpdateSavedRecipeDto,
  ) {
    return this.savedRecipesService.update(
      req.user.id,
      id,
      updateSavedRecipeDto,
    );
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.savedRecipesService.delete(req.user.id, id);
  }
}
