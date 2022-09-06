/*
  Warnings:

  - Added the required column `is_revoked` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tokens" ADD COLUMN     "is_revoked" BOOLEAN NOT NULL;
