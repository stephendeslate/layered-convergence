// [TRACED:FD-031] Backend unit tests with mocked PrismaService and JwtService
// [TRACED:FD-032] Auth tests: bcrypt salt 12, credential validation, token generation
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../common/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

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

    jwtService = {
      sign: jest.fn().mockReturnValue("mock-jwt-token"),
    };

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
    prisma.user.create.mockResolvedValue({
      id: "user-1",
      email: "tech@example.com",
      role: "TECHNICIAN",
    });

    const result = await service.register({
      email: "tech@example.com",
      password: "password123",
      name: "John Tech",
      role: "TECHNICIAN",
      companyId: "company-1",
    });

    expect(result.email).toBe("tech@example.com");
    const hashedPassword = prisma.user.create.mock.calls[0][0].data.password;
    const rounds = bcrypt.getRounds(hashedPassword);
    expect(rounds).toBe(12);
  });

  it("should reject login for non-existent user", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.login({ email: "nobody@example.com", password: "password" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should reject login with wrong password", async () => {
    const hashed = await bcrypt.hash("correctpassword", 12);
    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "tech@example.com",
      password: hashed,
      role: "TECHNICIAN",
    });

    await expect(
      service.login({ email: "tech@example.com", password: "wrongpassword" }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should return token on successful login", async () => {
    const hashed = await bcrypt.hash("correctpassword", 12);
    prisma.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "tech@example.com",
      password: hashed,
      role: "TECHNICIAN",
    });

    const result = await service.login({
      email: "tech@example.com",
      password: "correctpassword",
    });

    expect(result.accessToken).toBe("mock-jwt-token");
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: "user-1",
      email: "tech@example.com",
      role: "TECHNICIAN",
    });
  });
});
