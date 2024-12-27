import { Tables } from './tables';

export type TablesHelper<T extends keyof Tables> = Tables[T]['Row'];
export type TablesInsert<T extends keyof Tables> = Tables[T]['Insert'];
export type TablesUpdate<T extends keyof Tables> = Tables[T]['Update'];