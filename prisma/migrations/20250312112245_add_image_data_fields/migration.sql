/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Class" ADD COLUMN "imageData" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "imageData" TEXT,
    "capacity" INTEGER,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("capacity", "createdAt", "currentCount", "date", "description", "id", "isActive", "location", "title", "updatedAt") SELECT "capacity", "createdAt", "currentCount", "date", "description", "id", "isActive", "location", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
