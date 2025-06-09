/*
  Warnings:

  - Added the required column `sender` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- First add the columns with default values
ALTER TABLE "Message" 
ADD COLUMN "sender" TEXT DEFAULT 'Unknown',
ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to set updatedAt to createdAt
UPDATE "Message" 
SET "updatedAt" = "createdAt";

-- Now make the columns required
ALTER TABLE "Message" 
ALTER COLUMN "sender" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- Update timestamp default and sentiment
ALTER TABLE "Message" 
ALTER COLUMN "timestamp" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "sentiment" DROP NOT NULL;
