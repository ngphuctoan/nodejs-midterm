export {};

declare global {
  namespace PrismaJson {
    interface RecipeInfo {
      name: string;
      image?: string;
      content?: string;
    }
  }
}
