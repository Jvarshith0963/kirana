export function getErrorMessage(error) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (
    error.name === "TypeError" &&
    error.message?.toLowerCase().includes("fetch")
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  }

  if (error.response?.status >= 500) {
    return "The server is temporarily unavailable. Please try again later.";
  }

  if (error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}