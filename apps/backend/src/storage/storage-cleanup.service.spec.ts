import { Test, TestingModule } from '@nestjs/testing';
import { StorageCleanupService } from './storage-cleanup.service';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma.service';
import { SUPABASE } from './storage.provider';
import { Logger } from '@nestjs/common';

describe('StorageCleanupService', () => {
  let storageCleanUpService: StorageCleanupService;
  let prisma: DeepMockProxy<PrismaClient>;
  let supabase: DeepMockProxy<SupabaseClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageCleanupService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
        {
          provide: SUPABASE,
          useValue: mockDeep<SupabaseClient>(),
        },
      ],
    }).compile();

    storageCleanUpService = module.get(StorageCleanupService);
    prisma = module.get(PrismaService);
    supabase = module.get(SUPABASE);

    // Disables showing "intentional" errors.
    Logger.overrideLogger(false);
  });

  it('should remove unused images', async () => {
    const existingImages = [
      { info: { image: 'images/com_tam.avif' } },
      { info: { image: 'images/pho_bo.avif' } },
      { info: { image: 'images/banh_trang.avif' } },
    ] as Prisma.recipesModel[];
    prisma.recipes.findMany.mockResolvedValue(existingImages);
    const allImages = [
      { name: 'com_tam.avif' },
      { name: 'pho_bo.avif' },
      { name: 'banh_trang.avif' },
      { name: 'bun_bo_hue.avif' },
      { name: 'mi_quang.avif' },
    ];
    const removedImages = [
      { name: 'bun_bo_hue.avif' },
      { name: 'mi_quang.avif' },
    ];
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: jest.fn().mockResolvedValue({
        data: allImages,
        error: null,
      }),
      remove: jest.fn().mockResolvedValue({
        data: removedImages,
        error: null,
      }),
    });

    await expect(storageCleanUpService.handleCron()).resolves.toBeTruthy();
  });

  it('should return early when there is no unused images to remove', async () => {
    const existingImages = [
      { info: { image: 'images/com_tam.avif' } },
      { info: { image: 'images/pho_bo.avif' } },
      { info: { image: 'images/banh_trang.avif' } },
    ] as Prisma.recipesModel[];
    prisma.recipes.findMany.mockResolvedValue(existingImages);
    const allImages = [
      { name: 'com_tam.avif' },
      { name: 'pho_bo.avif' },
      { name: 'banh_trang.avif' },
    ];
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: jest.fn().mockResolvedValue({
        data: allImages,
        error: null,
      }),
    });

    await expect(storageCleanUpService.handleCron()).resolves.toBeTruthy();
  });

  it('should return early when there is a supabase listing error', async () => {
    const existingImages = [
      { info: { image: 'images/com_tam.avif' } },
      { info: { image: 'images/pho_bo.avif' } },
      { info: { image: 'images/banh_trang.avif' } },
    ] as Prisma.recipesModel[];
    prisma.recipes.findMany.mockResolvedValue(existingImages);
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'rm -rf your_supabase_storage/' },
      }),
    });

    await expect(storageCleanUpService.handleCron()).resolves.toBeFalsy();
  });

  it('should return early when there is a supabase removing error', async () => {
    const existingImages = [
      { info: { image: 'images/com_tam.avif' } },
      { info: { image: 'images/pho_bo.avif' } },
      { info: { image: 'images/banh_trang.avif' } },
    ] as Prisma.recipesModel[];
    prisma.recipes.findMany.mockResolvedValue(existingImages);
    const allImages = [
      { name: 'com_tam.avif' },
      { name: 'pho_bo.avif' },
      { name: 'banh_trang.avif' },
      { name: 'bun_bo_hue.avif' },
      { name: 'mi_quang.avif' },
    ];
    (supabase.storage.from as jest.Mock).mockReturnValue({
      list: jest.fn().mockResolvedValue({
        data: allImages,
        error: null,
      }),
      remove: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'you should soft-delete' },
      }),
    });

    await expect(storageCleanUpService.handleCron()).resolves.toBeFalsy();
  });
});
