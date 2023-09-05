/*
  Warnings:

  - You are about to alter the column `libraryId` on the `collection` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "libraryId" INTEGER NOT NULL,
    "name" TEXT,
    "date_created" DATETIME,
    "date_modified" DATETIME,
    CONSTRAINT "collection_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_collection" ("date_created", "date_modified", "id", "libraryId", "name", "uuid") SELECT "date_created", "date_modified", "id", "libraryId", "name", "uuid" FROM "collection";
DROP TABLE "collection";
ALTER TABLE "new_collection" RENAME TO "collection";
CREATE UNIQUE INDEX "collection_uuid_key" ON "collection"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
