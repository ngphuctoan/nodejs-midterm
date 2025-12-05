import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSavedRecipeDto } from './dto/create-saved-recipe.dto';
import { UpdateSavedRecipeDto } from './dto/update-saved-recipe.dto';
import slugify from 'slugify';
import sharp from 'sharp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SavedRecipesService {
  private readonly imageId = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyz',
    8,
  );

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(ownerId: number) {
    const savedRecipes = await this.prisma.saved_recipes.findMany({
      where: {
        owner_id: ownerId,
      },
    });
    return savedRecipes;
  }

  async findOne(ownerId: number, id: number) {
    const savedRecipe = await this.prisma.saved_recipes.findUnique({
      where: {
        id,
        owner_id: ownerId,
      },
    });
    if (!savedRecipe) {
      throw new NotFoundException();
    }
    return savedRecipe;
  }

  async create(ownerId: number, data: CreateSavedRecipeDto) {
    const savedRecipe = await this.prisma.saved_recipes.create({
      data: {
        ...data,
        owner_id: ownerId,
      },
    });
    return savedRecipe;
  }

  async getImage(ownerId: number, id: number, expirySeconds = 3_600) {
    const savedRecipe = await this.findOne(ownerId, id);
    if (!savedRecipe.info.image) {
      return undefined;
    }

    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .createSignedUrl(savedRecipe.info.image, expirySeconds);
    if (error) {
      return undefined;
    }

    return data.signedUrl;
  }

  async update(ownerId: number, id: number, data: UpdateSavedRecipeDto) {
    const existing = await this.findOne(ownerId, id);
    const savedRecipe = await this.prisma.saved_recipes.update({
      where: {
        id,
        owner_id: ownerId,
      },
      data: {
        ...data,
        info: {
          ...existing.info,
          ...data.info,
        },
      },
    });
    return savedRecipe;
  }

  async uploadImage(ownerId: number, id: number, image?: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('No image uploaded');
    }

    const existing = await this.findOne(ownerId, id);

    const randId = this.imageId();
    const slug = slugify(existing.info.name, { lower: true });

    const processedBuffer = await sharp(image.buffer)
      .resize(1280, 720, { fit: 'inside' })
      .avif({ quality: 70 })
      .toBuffer();

    const filePath = `images/${id}-${slug}-${randId}.avif`;

    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .upload(filePath, processedBuffer, {
        upsert: true,
        contentType: image.mimetype,
      });
    if (error) {
      throw new BadRequestException(error.message);
    }

    const savedRecipe = await this.prisma.saved_recipes.update({
      where: {
        id,
        owner_id: ownerId,
      },
      data: {
        info: {
          ...existing.info,
          image: data.path,
        },
      },
    });

    return savedRecipe;
  }
}
