import { Provider } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE = 'SUPABASE';

export const supabaseProvider: Provider = {
  provide: SUPABASE,
  useFactory: () =>
    createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!),
};
