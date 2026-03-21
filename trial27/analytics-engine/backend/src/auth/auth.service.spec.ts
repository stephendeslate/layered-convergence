// [TRACED:AE-031] Unit tests with Test.createTestingModule + mocked deps
// [TRACED:AE-032] Auth service tests for registration and login
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../common/prisma.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let prisma: { user: { create: jest.Mock; findFirst: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn().mockReturnValue("test-token") };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should register a user with bcrypt salt 12", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    prisma.user.create.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      role: "VIEWER",
      tenantId: "tenant-1",
    });

    const result = await service.register({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
      role: "VIEWER",
      tenantId: "tenant-1",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(result.token).toBe("test-token");
    expect(result.user.email).toBe("test@example.com");
  });

  it("should reject login with invalid credentials", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.login({ email: "bad@example.com", password: "wrong" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should reject login with wrong password", async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hashed",
      tenantId: "tenant-1",
      role: "VIEWER",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: "test@example.com", password: "wrong" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should return token on successful login", async () => {
    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      passwordHash: "hashed",
      tenantId: "tenant-1",
      role: "VIEWER",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({
      email: "test@example.com",
      password: "correct",
    });

    expect(result.token).toBe("test-token");
    expect(jwtService.sign).toHaveBeenCalled();
  });
});
