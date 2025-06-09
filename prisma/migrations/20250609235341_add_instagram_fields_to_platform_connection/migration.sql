/*
  Warnings:

  - Added the required column `accountName` to the `PlatformConnection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformUserId` to the `PlatformConnection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlatformConnection" ADD COLUMN     "accountName" TEXT NOT NULL,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "platformUserId" TEXT NOT NULL;
