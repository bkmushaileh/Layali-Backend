import bcrypt from "bcrypt";

export const generateHashPassword = async (password: string) => {
  const saltRouonds = 10;
  const hashpasswrd = await bcrypt.hash(password, saltRouonds);
  return hashpasswrd;
};
