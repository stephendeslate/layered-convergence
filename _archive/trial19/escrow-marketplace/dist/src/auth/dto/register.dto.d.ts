export declare enum UserRole {
    BUYER = "BUYER",
    PROVIDER = "PROVIDER",
    ADMIN = "ADMIN"
}
export declare class RegisterDto {
    email: string;
    password: string;
    role: UserRole;
}
