/*
  Warnings:

  - You are about to alter the column `libraryId` on the `Object` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `locationId` on the `Object` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Made the column `collectionId` on table `Object` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Object" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "obj_name" TEXT,
    "kind" INTEGER,
    "hidden" BOOLEAN,
    "favorite" BOOLEAN,
    "important" BOOLEAN,
    "note" TEXT,
    "date_created" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "date_modified" DATETIME,
    "path" TEXT,
    "extension" TEXT,
    "relative_path" TEXT,
    "parsed_path" TEXT,
    "parsed" BOOLEAN,
    "indexed" BOOLEAN,
    "thumbnail_path" TEXT,
    "thumbnail" BOOLEAN,
    "libraryId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "collectionId" INTEGER NOT NULL,
    CONSTRAINT "Object_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "library" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Object_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Object_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collection" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Object" ("collectionId", "date_created", "date_modified", "extension", "favorite", "hidden", "id", "important", "indexed", "kind", "libraryId", "locationId", "note", "obj_name", "parsed", "parsed_path", "path", "relative_path", "thumbnail", "thumbnail_path", "uuid") SELECT "collectionId", "date_created", "date_modified", "extension", "favorite", "hidden", "id", "important", "indexed", "kind", "libraryId", "locationId", "note", "obj_name", "parsed", "parsed_path", "path", "relative_path", "thumbnail", "thumbnail_path", "uuid" FROM "Object";
DROP TABLE "Object";
ALTER TABLE "new_Object" RENAME TO "Object";
CREATE UNIQUE INDEX "Object_uuid_key" ON "Object"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
