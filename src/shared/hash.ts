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

export const comparePassword = async (candidatePassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};
