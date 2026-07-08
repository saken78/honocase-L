export type Pagination<T> = {
  data: T;
  take?: number;
  page?: number;
  total?: number;
};
