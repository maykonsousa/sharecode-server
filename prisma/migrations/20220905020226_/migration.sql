/*
  Warnings:

  - You are about to drop the column `is_revoked` on the `tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "is_revoked";
