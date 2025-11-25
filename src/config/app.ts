import { env } from './env';

const DEFAULT_APP_NAME = 'Cohort Enrollment Platform'

export const APP_NAME = env.VITE_APP_NAME ?? DEFAULT_APP_NAME

