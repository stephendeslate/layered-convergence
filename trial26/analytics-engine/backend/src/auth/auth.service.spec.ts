// [TRACED:AE-031] Unit tests in src/ directory
// [TRACED:AE-032] Test.createTestingModule with mocked deps
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-001] Auth service unit tests with mocked dependencies
describe("AuthService", () => {
  let service: AuthService;
  let prisma: { user: { findFirst: jest.Mock; create: jest.Mock } };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
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

  describe("register", () => {
    it("should create a new user with hashed password", async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        role: "VIEWER",
        tenantId: "tenant-1",
      });

      const result = await service.register({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "VIEWER",
        tenantId: "tenant-1",
      });

      expect(result.accessToken).toBe("mock-token");
      expect(result.user.email).toBe("test@example.com");
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "test@example.com",
            role: "VIEWER",
          }),
        }),
      );
    });

    it("should throw ConflictException if email exists", async () => {
      prisma.user.findFirst.mockResolvedValue({ id: "existing" });

      await expect(
        service.register({
          name: "Test",
          email: "test@example.com",
          password: "password123",
          role: "VIEWER",
          tenantId: "tenant-1",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should return token for valid credentials", async () => {
      const hash = await bcrypt.hash("password123", 12);
      prisma.user.findFirst.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash: hash,
        role: "VIEWER",
        tenantId: "tenant-1",
      });

      const result = await service.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.accessToken).toBe("mock-token");
    });

    it("should throw UnauthorizedException for invalid email", async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: "wrong@example.com", password: "password123" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for wrong password", async () => {
      const hash = await bcrypt.hash("password123", 12);
      prisma.user.findFirst.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        passwordHash: hash,
        role: "VIEWER",
        tenantId: "tenant-1",
      });

      await expect(
        service.login({ email: "test@example.com", password: "wrongpassword" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
