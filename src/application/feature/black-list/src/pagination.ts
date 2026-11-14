import { z } from "zod";

export const SELECT_MENU_PAGE_SIZE = 25;

export const IdPageRefSchema = z.object({
  id: z.coerce.number().int(),
  page: z.coerce.number().int(),
});

export type IdPageRef = z.infer<typeof IdPageRefSchema>;

export function encodeIdPageRef(id: number, page: number): string {
  return `${id}:${page}`;
}

export function decodeIdPageRef(value: string): unknown {
  const [id, page] = value.split(":");
  return { id, page };
}

export type Page<T> = {
  items: T[];
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = SELECT_MENU_PAGE_SIZE,
): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = currentPage * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    totalPages,
    hasPrev: currentPage > 0,
    hasNext: currentPage < totalPages - 1,
  };
}
