type ApiErrorItem = {
  field?: string;
  message: string;
};

type ApiErrorResponse = {
  success: false;
  status: "error" | "fail";
  message: string;
  errors: ApiErrorItem[];
};

type SuccessResponse<T> = {
  success: true;
  status: "success";
  message: string;
  data: T;
};
