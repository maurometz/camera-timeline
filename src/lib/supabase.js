import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xluqekobxuqwqfybghos.supabase.co';
const supabaseAnonKey = 'sb_publishable_SAPiGHlxth_VWFIPJFZRtA_4giGEZd4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
