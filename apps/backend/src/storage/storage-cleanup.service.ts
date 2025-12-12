import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma.service';
import { SUPABASE } from './storage.provider';

@Injectable()
export class StorageCleanupService {
  private readonly logger = new Logger(StorageCleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE) private readonly supabase: SupabaseClient,
  ) {}

  // Add timezones because why not :P
  @Cron('0 3 * * 0', { timeZone: 'Asia/Ho_Chi_Minh' })
  async handleCron() {
    const recipeInfos = await this.prisma.recipes.findMany({
      select: { info: true },
    });
    const existingImages = recipeInfos
      .map(({ info }) => info.image)
      .filter(Boolean);

    const { data: listData, error: listError } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .list('images');
    if (listError) {
      this.logger.error(
        `Clean up failed! An error occured when listing files: ${listError.message}`,
      );
      return false;
    }
    const allImages = listData.map((file) => `images/${file.name}`);

    const imagesToDelete = allImages.filter(
      (image) => !existingImages.includes(image),
    );
    if (imagesToDelete.length === 0) {
      this.logger.log('No unused images to delete');
      return true;
    }

    const { error: removeError } = await this.supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .remove(imagesToDelete);
    if (removeError) {
      this.logger.error(
        `Clean up failed! An error occured when removing files: ${removeError.message}`,
      );
      return false;
    }

    this.logger.log(`Removed ${imagesToDelete.length} unused image(s)`);
    return true;
  }
}
