-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassCurriculumItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "order" INTEGER NOT NULL,
    "dueDate" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "classId" TEXT NOT NULL,
    CONSTRAINT "ClassCurriculumItem_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClassCurriculumItem" ("classId", "content", "createdAt", "description", "dueDate", "fileType", "fileUrl", "id", "isPublished", "order", "title", "type", "updatedAt") SELECT "classId", "content", "createdAt", "description", "dueDate", "fileType", "fileUrl", "id", "isPublished", "order", "title", "type", "updatedAt" FROM "ClassCurriculumItem";
DROP TABLE "ClassCurriculumItem";
ALTER TABLE "new_ClassCurriculumItem" RENAME TO "ClassCurriculumItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
