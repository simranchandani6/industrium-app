export const DEMO_EMAIL = "simra.chandani@bacancy.com";
export const DEMO_PASSWORD = "DemoPass123!";

export function isDemoCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}
