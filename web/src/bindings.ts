// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "library.get_all_libraries", input: never, result: Library[] } | 
        { key: "library.get_all_objects", input: never, result: Object[] } | 
        { key: "library.get_doc_by_id", input: GetDocById, result: Object | null } | 
        { key: "notifications.get_notifications", input: never, result: Notification[] } | 
        { key: "search.search", input: SearchArgs, result: SearchResult[] } | 
        { key: "tags.get_object_with_tags", input: AddTagToObjectArgs, result: [Tag[], Object] } | 
        { key: "tags.get_tags", input: never, result: Tag[] } | 
        { key: "tasks.getAllUsers", input: never, result: User[] } | 
        { key: "version", input: never, result: string },
    mutations: 
        { key: "library.add_new_location", input: AddNewLocation, result: null } | 
        { key: "tags.add_new_tag", input: CreateNewTagArgs, result: null } | 
        { key: "tags.add_tag_to_object", input: AddTagToObjectArgs, result: null } | 
        { key: "tasks.createNewUser", input: CreateNewUserParam, result: User },
    subscriptions: 
        { key: "notifications.listen", input: never, result: CodexNotification }
};

export type NotificationType = "Info" | "Warning" | "Error" | "FileAdded" | "FileRemoved" | "FileUpdated" | "LibraryAdded" | "LibraryRemoved" | "LibraryUpdated" | "ObjectParsed" | "ObjectAdded" | "ObjectRemoved" | "ObjectUpdated" | "ThumbnailGenerated" | "IndexingStarted" | "IndexingFinished" | "IndexingFailed" | "SearchStarted" | "SearchFinished" | "SearchFailed" | "ParsingError"

export type SearchArgs = { query: string }

export type Object = { id: number; uuid: string; obj_name: string | null; kind: number | null; hidden: boolean | null; favorite: boolean | null; important: boolean | null; note: string | null; date_created: string | null; date_modified: string | null; path: string | null; extension: string | null; relative_path: string | null; parsed_path: string | null; parsed: boolean | null; indexed: boolean | null; thumbnail_path: string | null; thumbnail: boolean | null; libraryId: string; locationId: string }

export type Library = { id: number; uuid: string; name: string | null; redundancy_goal: number | null; date_created: string | null; date_modified: string | null }

export type CreateNewUserParam = { id: string; name: string }

export type AddTagToObjectArgs = { tag_uuids: string[]; object_uuid: string }

export type AddTagToObjectArgs = { tag_uuid: string; object_uuid: string }

export type GetDocById = { id: number }

export type SearchResult = { title: string; snippet: string; score: number; object: Object }

export type AddNewLocation = { library_id: string; name: string; path: string; is_archived: boolean; hidden: boolean; date_created: string }

export type CodexNotification = { message: string; notification_type: NotificationType }

export type User = { id: string; displayName: string }

export type Tag = { id: number; uuid: string; name: string | null; color: string | null; redundancy_goal: number | null; date_created: string | null; date_modified: string | null }

export type CreateNewTagArgs = { name: string; color: string }

export type Notification = { id: number; read: boolean; data: number; message: string | null; expires_at: string | null }
