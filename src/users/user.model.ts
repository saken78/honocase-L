export type UserResponse = {
  id: string;
  email: string;
  role: string;
};

export type GetUserById<T> = {
  data: T;
};

export type GetAllUser<T> = {
  data: T;
};
