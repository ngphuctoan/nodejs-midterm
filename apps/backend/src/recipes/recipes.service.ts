import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import { customAlphabet } from 'nanoid';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import sharp from 'sharp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RecipesService {
  private readonly imageId = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyz',
    8,
  );

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(ownerId: number) {
    const recipes = await this.prisma.recipes.findMany({
      where: {
        owner_id: ownerId,
      },
    });
    return recipes;
  }

  async findOne(ownerId: number, id: number) {
    const recipe = await this.prisma.recipes.findUnique({
      where: {
        id,
        owner_id: ownerId,
      },
    });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }
    return recipe;
  }

  async create(ownerId: number, data: CreateRecipeDto) {
    const reminder = data.reminder ? new Date(data.reminder) : undefined;
    const recipe = await this.prisma.recipes.create({
      data: {
        ...data,
        owner_id: ownerId,
        reminder,
      },
    });
    return recipe;
  }

  async getImage(ownerId: number, id: number, expirySeconds = 3_600) {
    const recipe = await this.findOne(ownerId, id);
    if (!recipe.info.image) {
      return undefined;
    }

    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .createSignedUrl(recipe.info.image, expirySeconds);
    if (error) {
      return undefined;
    }

    return data.signedUrl;
  }

  async update(ownerId: number, id: number, data: UpdateRecipeDto) {
    const existing = await this.findOne(ownerId, id);
    const reminder = data.reminder ? new Date(data.reminder) : undefined;
    const recipe = await this.prisma.recipes.update({
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
        reminder,
      },
    });
    return recipe;
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

    const recipe = await this.prisma.recipes.update({
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

    return recipe;
  }

  async delete(ownerId: number, id: number) {
    const recipe = await this.prisma.recipes.delete({
      where: {
        id,
        owner_id: ownerId,
      },
    });
    return recipe;
  }
}
