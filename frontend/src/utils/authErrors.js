export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message ?? fallback;
}

export function getFieldErrors(error) {
  const errors = error?.response?.data?.errors;

  if (!Array.isArray(errors)) {
    return {};
  }

  return errors.reduce((acc, item) => {
    acc[item.field] = item.message;
    return acc;
  }, {});
}
