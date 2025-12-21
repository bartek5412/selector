/*
  Warnings:

  - You are about to drop the column `elementType` on the `Letter` table. All the data in the column will be lost.
  - You are about to drop the column `elementValue` on the `Letter` table. All the data in the column will be lost.
  - You are about to drop the column `margin` on the `Letter` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Letter` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Letter` table. All the data in the column will be lost.
  - Added the required column `type` to the `Letter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Letter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Letter" DROP COLUMN "elementType",
DROP COLUMN "elementValue",
DROP COLUMN "margin",
DROP COLUMN "price",
DROP COLUMN "unit",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "LetterOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "elementType" TEXT NOT NULL,
    "elementValue" DOUBLE PRECISION,
    "margin" DOUBLE PRECISION,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LetterOption_pkey" PRIMARY KEY ("id")
);
