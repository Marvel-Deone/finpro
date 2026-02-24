/*
  Warnings:

  - You are about to drop the column `title` on the `Exam` table. All the data in the column will be lost.
  - Added the required column `unit` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Stock" ADD COLUMN     "unit" TEXT NOT NULL;
