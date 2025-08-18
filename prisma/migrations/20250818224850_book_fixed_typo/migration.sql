/*
  Warnings:

  - You are about to drop the column `isAvliable` on the `Book` table. All the data in the column will be lost.
  - Added the required column `isAvaliable` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Book" DROP COLUMN "isAvliable",
ADD COLUMN     "isAvaliable" BOOLEAN NOT NULL;
