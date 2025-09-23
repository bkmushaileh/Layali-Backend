{
  /*This is reusable error helper♺ */
}

export const invalidCredentialsErrorHandler = (
  message = "Invalid Credentials! 🙅🏽‍♀️"
) => {
  return {
    status: 401,
    error: "Unauthorized",
    message,
  };
};
