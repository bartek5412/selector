-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "canEditParameters" BOOLEAN NOT NULL DEFAULT false,
    "canViewAllConfigs" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for "admin123" using bcrypt
INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "canEditParameters", "canViewAllConfigs", "createdAt", "updatedAt")
VALUES (
    'default-admin',
    'admin@example.com',
    'Administrator',
    '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq',
    'ADMIN',
    true,
    true,
    NOW(),
    NOW()
);

-- Add userId column as nullable first
ALTER TABLE "LetterConfiguration" ADD COLUMN "userId" TEXT;

-- Assign existing configurations to default admin
UPDATE "LetterConfiguration" SET "userId" = 'default-admin' WHERE "userId" IS NULL;

-- Now make userId required
ALTER TABLE "LetterConfiguration" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "LetterConfiguration" ADD CONSTRAINT "LetterConfiguration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
