/*
  Warnings:

  - The primary key for the `tag_on_Object` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pub_id` on the `tag` table. All the data in the column will be lost.
  - You are about to drop the column `instance_id` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `libraryId` on the `location` table. All the data in the column will be lost.
  - The required column `uuid` was added to the `tag` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `locationId` to the `Object` table without a default value. This is not possible if the table is not empty.
  - Made the column `libraryId` on table `Object` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "collection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "name" TEXT,
    "date_created" DATETIME,
    "date_modified" DATETIME,
    CONSTRAINT "collection_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "library" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" INTEGER NOT NULL,
    "message" TEXT,
    "expires_at" DATETIME
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tag_on_Object" (
    "tag_id" TEXT NOT NULL,
    "Object_id" TEXT NOT NULL,

    PRIMARY KEY ("tag_id", "Object_id"),
    CONSTRAINT "tag_on_Object_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag" ("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "tag_on_Object_Object_id_fkey" FOREIGN KEY ("Object_id") REFERENCES "Object" ("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_tag_on_Object" ("Object_id", "tag_id") SELECT "Object_id", "tag_id" FROM "tag_on_Object";
DROP TABLE "tag_on_Object";
ALTER TABLE "new_tag_on_Object" RENAME TO "tag_on_Object";
CREATE TABLE "new_tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "color" TEXT,
    "redundancy_goal" INTEGER,
    "date_created" DATETIME,
    "date_modified" DATETIME
);
INSERT INTO "new_tag" ("color", "date_created", "date_modified", "id", "name", "redundancy_goal") SELECT "color", "date_created", "date_modified", "id", "name", "redundancy_goal" FROM "tag";
DROP TABLE "tag";
ALTER TABLE "new_tag" RENAME TO "tag";
CREATE UNIQUE INDEX "tag_uuid_key" ON "tag"("uuid");
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
    "libraryId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "collectionId" INTEGER,
    CONSTRAINT "Object_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "library" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Object_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Object_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Object" ("date_created", "date_modified", "extension", "favorite", "hidden", "id", "important", "indexed", "kind", "libraryId", "note", "obj_name", "path", "relative_path", "uuid") SELECT "date_created", "date_modified", "extension", "favorite", "hidden", "id", "important", "indexed", "kind", "libraryId", "note", "obj_name", "path", "relative_path", "uuid" FROM "Object";
DROP TABLE "Object";
ALTER TABLE "new_Object" RENAME TO "Object";
CREATE UNIQUE INDEX "Object_uuid_key" ON "Object"("uuid");
CREATE TABLE "new_location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "path" TEXT NOT NULL,
    "total_capacity" INTEGER,
    "available_capacity" INTEGER,
    "is_archived" BOOLEAN,
    "generate_preview_media" BOOLEAN,
    "hidden" BOOLEAN,
    "date_created" DATETIME,
    "is_dir" BOOLEAN,
    "recursive" BOOLEAN,
    "collectionId" INTEGER,
    CONSTRAINT "location_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_location" ("available_capacity", "date_created", "generate_preview_media", "hidden", "id", "is_archived", "name", "path", "total_capacity", "uuid") SELECT "available_capacity", "date_created", "generate_preview_media", "hidden", "id", "is_archived", "name", "path", "total_capacity", "uuid" FROM "location";
DROP TABLE "location";
ALTER TABLE "new_location" RENAME TO "location";
CREATE UNIQUE INDEX "location_uuid_key" ON "location"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "collection_uuid_key" ON "collection"("uuid");
