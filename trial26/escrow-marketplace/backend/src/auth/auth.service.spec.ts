// [TRACED:EM-032] Unit tests in src/ with mocked deps
// [TRACED:EM-033] Test.createTestingModule with jest.fn() mocks
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-001] Auth service unit tests
describe("AuthService", () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findFirst: jest.fn(), create: jest.fn() } };
    jwtService = { sign: jest.fn().mockReturnValue("mock-token") };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should register a new user", async () => {
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: "u1", email: "test@test.com", role: "BUYER" });

    const result = await service.register({ name: "Test", email: "test@test.com", password: "password123", role: "BUYER" });
    expect(result.accessToken).toBe("mock-token");
  });

  it("should throw ConflictException on duplicate email", async () => {
    prisma.user.findFirst.mockResolvedValue({ id: "existing" });
    await expect(service.register({ name: "T", email: "t@t.com", password: "pass1234", role: "BUYER" })).rejects.toThrow(ConflictException);
  });

  it("should login with valid credentials", async () => {
    const hash = await bcrypt.hash("password123", 12);
    prisma.user.findFirst.mockResolvedValue({ id: "u1", email: "t@t.com", passwordHash: hash, role: "BUYER" });
    const result = await service.login({ email: "t@t.com", password: "password123" });
    expect(result.accessToken).toBe("mock-token");
  });

  it("should reject invalid password", async () => {
    const hash = await bcrypt.hash("password123", 12);
    prisma.user.findFirst.mockResolvedValue({ id: "u1", email: "t@t.com", passwordHash: hash, role: "BUYER" });
    await expect(service.login({ email: "t@t.com", password: "wrong" })).rejects.toThrow(UnauthorizedException);
  });
});
