export function getFriendlyApiMessage(error, fallback = 'Something went wrong. Please try again.') {
  const message = error?.response?.data?.message ?? error?.message ?? fallback;

  if (message === 'Only verified listings can be resumed.') {
    return 'This listing must be approved by admin before it can be resumed.';
  }

  if (message === 'Not authorized.') {
    return 'You do not have permission to perform this action.';
  }

  return message;
}
