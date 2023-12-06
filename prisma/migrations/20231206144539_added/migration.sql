/*
  Warnings:

  - Added the required column `description` to the `Recipes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "ingredients" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Recipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recipes" ("createdAt", "id", "ingredients", "title", "userId") SELECT "createdAt", "id", "ingredients", "title", "userId" FROM "Recipes";
DROP TABLE "Recipes";
ALTER TABLE "new_Recipes" RENAME TO "Recipes";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
