-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Object" (
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
    "indexed" BOOLEAN,
    "libraryId" INTEGER,
    CONSTRAINT "Object_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "library" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "location" (
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
    "instance_id" INTEGER,
    "libraryId" INTEGER,
    CONSTRAINT "location_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "library" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "library" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT,
    "redundancy_goal" INTEGER,
    "date_created" DATETIME,
    "date_modified" DATETIME
);

-- CreateTable
CREATE TABLE "tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pub_id" BLOB NOT NULL,
    "name" TEXT,
    "color" TEXT,
    "redundancy_goal" INTEGER,
    "date_created" DATETIME,
    "date_modified" DATETIME
);

-- CreateTable
CREATE TABLE "tag_on_Object" (
    "tag_id" INTEGER NOT NULL,
    "Object_id" INTEGER NOT NULL,

    PRIMARY KEY ("tag_id", "Object_id"),
    CONSTRAINT "tag_on_Object_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "tag_on_Object_Object_id_fkey" FOREIGN KEY ("Object_id") REFERENCES "Object" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "label" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pub_id" BLOB NOT NULL,
    "name" TEXT,
    "date_created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modified" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "label_on_Object" (
    "date_created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label_id" INTEGER NOT NULL,
    "Object_id" INTEGER NOT NULL,

    PRIMARY KEY ("label_id", "Object_id"),
    CONSTRAINT "label_on_Object_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "label" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "label_on_Object_Object_id_fkey" FOREIGN KEY ("Object_id") REFERENCES "Object" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "Object_uuid_key" ON "Object"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "location_uuid_key" ON "location"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "library_uuid_key" ON "library"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tag_pub_id_key" ON "tag"("pub_id");

-- CreateIndex
CREATE UNIQUE INDEX "label_pub_id_key" ON "label"("pub_id");
