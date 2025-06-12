import bcrypt from "bcrypt";

const generateSalt = async (): Promise<string> => {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return salt;
  } catch (err) {
    throw new Error(`Salt generation error: ${err}`);
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, await generateSalt());
    return hashedPassword;
  } catch (error) {
    throw new Error("Hashing failed");
  }
};
