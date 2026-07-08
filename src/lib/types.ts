export type Pagination<T> = {
  data: T;
  take?: number;
  page?: number;
  total?: number;
};

export function parsePagination(page: number, take: number) {
  page = isNaN(page) ? 1 : page;
  take = isNaN(take) ? 10 : take;

  if (page === undefined) {
    page = isNaN(page) ? 1 : page;
  }

  if (take === undefined) {
    take = isNaN(take) ? 10 : take;
  }
  return {
    take,
    page,
  };
}
