import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Drizzle, DRIZZLE } from '../db/db.provider';
import { recipesTable } from '../db/schemas';
import { and, eq, sql } from 'drizzle-orm';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import path from 'node:path';
import { customAlphabet } from 'nanoid';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeInfo } from '../types/recipe-info';

@Injectable()
export class RecipesService {
  constructor(
    @Inject(DRIZZLE) private db: Drizzle,
    @Inject(SUPABASE) private supabase: SupabaseClient,
  ) {}

  async findAll(ownerId: number) {
    const recipes = await this.db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.ownerId, ownerId));
    return recipes;
  }

  async findOne(ownerId: number, id: number) {
    const [recipe] = await this.db
      .select()
      .from(recipesTable)
      .where(and(eq(recipesTable.ownerId, ownerId), eq(recipesTable.id, id)));
    if (!recipe) {
      throw new NotFoundException();
    }
    return recipe;
  }

  async create(ownerId: number, data: CreateRecipeDto) {
    const reminder = data.reminder ? new Date(data.reminder) : undefined;
    const [recipe] = await this.db
      .insert(recipesTable)
      .values({
        ...data,
        ownerId,
        reminder,
      })
      .returning();
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
    const info = data.info
      ? sql<RecipeInfo>`info || ${JSON.stringify(data.info)}`
      : undefined;
    const reminder = data.reminder ? new Date(data.reminder) : undefined;
    const [recipe] = await this.db
      .update(recipesTable)
      .set({
        ...data,
        info,
        reminder,
      })
      .where(eq(recipesTable.id, id))
      .returning();
    return recipe;
  }

  async uploadImage(ownerId: number, id: number, image?: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('No image uploaded');
    }

    const existing = await this.findOne(ownerId, id);

    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

    const randId = nanoid();
    const slug = slugify(existing.info.name, { lower: true });
    const ext = path.extname(image.originalname);

    const filePath = `images/${id}-${slug}-${randId}${ext}`;

    const { data, error } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .upload(filePath, image.buffer, {
        upsert: true,
        contentType: image.mimetype,
      });
    if (error) {
      throw new BadRequestException(error.message);
    }

    const [recipe] = await this.db
      .update(recipesTable)
      .set({
        info: sql`jsonb_set(info, {image}, ${data.path}::jsonb)`,
      })
      .where(eq(recipesTable.id, id))
      .returning();

    return recipe;
  }
}
