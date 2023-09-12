/*
  Warnings:

  - The primary key for the `tag_on_Object` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `Object_id` on the `tag_on_Object` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `tag_id` on the `tag_on_Object` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- AlterTable
ALTER TABLE "Object" ADD COLUMN "description" TEXT;
ALTER TABLE "Object" ADD COLUMN "pub_name" TEXT;

-- AlterTable
ALTER TABLE "collection" ADD COLUMN "description" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tag_on_Object" (
    "tag_id" INTEGER NOT NULL,
    "Object_id" INTEGER NOT NULL,

    PRIMARY KEY ("tag_id", "Object_id"),
    CONSTRAINT "tag_on_Object_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "tag_on_Object_Object_id_fkey" FOREIGN KEY ("Object_id") REFERENCES "Object" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_tag_on_Object" ("Object_id", "tag_id") SELECT "Object_id", "tag_id" FROM "tag_on_Object";
DROP TABLE "tag_on_Object";
ALTER TABLE "new_tag_on_Object" RENAME TO "tag_on_Object";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
