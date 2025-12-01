import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { type Drizzle, DRIZZLE } from '../db/db.provider';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { savedRecipesTable } from '../db/schemas';
import { and, eq, sql } from 'drizzle-orm';
import { CreateSavedRecipeDto } from './dto/create-saved-recipe.dto';
import { RecipeInfo } from '../types/recipe-info';
import { UpdateSavedRecipeDto } from './dto/update-saved-recipe.dto';
import slugify from 'slugify';
import sharp from 'sharp';

@Injectable()
export class SavedRecipesService {
  private readonly imageId = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyz',
    8,
  );

  constructor(
    @Inject(DRIZZLE) private readonly db: Drizzle,
    @Inject(SUPABASE) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(ownerId: number) {
    const savedRecipes = await this.db
      .select()
      .from(savedRecipesTable)
      .where(eq(savedRecipesTable.ownerId, ownerId));
    return savedRecipes;
  }

  async findOne(ownerId: number, id: number) {
    const [savedRecipe] = await this.db
      .select()
      .from(savedRecipesTable)
      .where(
        and(
          eq(savedRecipesTable.ownerId, ownerId),
          eq(savedRecipesTable.id, id),
        ),
      );
    if (!savedRecipe) {
      throw new NotFoundException();
    }
    return savedRecipe;
  }

  async create(ownerId: number, data: CreateSavedRecipeDto) {
    const [savedRecipe] = await this.db
      .insert(savedRecipesTable)
      .values({
        ...data,
        ownerId,
      })
      .returning();
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
    const info = data.info
      ? sql<RecipeInfo>`info || ${JSON.stringify(data.info)}`
      : undefined;
    const [savedRecipe] = await this.db
      .update(savedRecipesTable)
      .set({
        ...data,
        info,
      })
      .where(
        and(
          eq(savedRecipesTable.ownerId, ownerId),
          eq(savedRecipesTable.id, id),
        ),
      )
      .returning();
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

    const [savedRecipe] = await this.db
      .update(savedRecipesTable)
      .set({
        info: sql`jsonb_set(info, {image}, ${data.path}::jsonb)`,
      })
      .where(eq(savedRecipesTable.id, id))
      .returning();

    return savedRecipe;
  }
}
