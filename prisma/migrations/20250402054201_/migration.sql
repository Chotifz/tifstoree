/*
  Warnings:

  - You are about to drop the column `publisherName` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isFeatured` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isNew` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isPopular` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "publisherName";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isActive",
DROP COLUMN "isFeatured",
DROP COLUMN "isNew",
DROP COLUMN "isPopular";
