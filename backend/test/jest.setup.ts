import * as dotenv from "dotenv";

// Load test environment variables before each test
dotenv.config({ path: ".env.test" });

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mocking modules that are hard to test
jest.mock("bcrypt", () => ({
  compare: jest
    .fn()
    .mockImplementation((plainText, hash) =>
      Promise.resolve(plainText === "Password123!")
    ),
  hash: jest
    .fn()
    .mockImplementation((plainText) => Promise.resolve(`hashed_${plainText}`)),
}));
