import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "development-secret-change-me";

export function verifyBearerToken(authorizationHeader: string | undefined): boolean {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  try {
    jwt.verify(token, jwtSecret);
    return true;
  } catch {
    return false;
  }
}

export function signDevelopmentToken(): string {
  return jwt.sign({ scope: "endorse:translate" }, jwtSecret, { expiresIn: "1h" });
}
