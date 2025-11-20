import type { Database } from '@/types/database'

type UserInsert = Database['public']['Tables']['users']['Insert']

type AssertNever = UserInsert extends never ? true : false

const assertNever: AssertNever = false
