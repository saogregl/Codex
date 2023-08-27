// This file was generated by [rspc](https://github.com/oscartbeaumont/rspc). Do not edit this file manually.

export type Procedures = {
    queries: 
        { key: "library.get_all_libraries", input: never, result: Library[] } | 
        { key: "library.get_all_objects", input: never, result: Object[] } | 
        { key: "library.get_doc_by_id", input: GetDocById, result: Object | null } | 
        { key: "notifications.get_notifications", input: never, result: Notification[] } | 
        { key: "search.search", input: SearchArgs, result: SearchResult[] } | 
        { key: "tasks.getAllUsers", input: never, result: User[] } | 
        { key: "version", input: never, result: string },
    mutations: 
        { key: "library.add_new_location", input: AddNewLocation, result: Location } | 
        { key: "tasks.createNewUser", input: CreateNewUserParam, result: User },
    subscriptions: 
        { key: "notifications.listen", input: never, result: CodexNotification }
};

export type NotificationType = "Info" | "Warning" | "Error" | "FileAdded" | "FileRemoved" | "FileUpdated" | "LibraryAdded" | "LibraryRemoved" | "LibraryUpdated" | "ObjectParsed" | "ObjectAdded" | "ObjectRemoved" | "ObjectUpdated" | "ThumbnailGenerated" | "IndexingStarted" | "IndexingFinished" | "IndexingFailed" | "SearchStarted" | "SearchFinished" | "SearchFailed" | "ParsingError"

export type SearchArgs = { query: string }

export type Object = { id: number; uuid: string; obj_name: string | null; kind: number | null; hidden: boolean | null; favorite: boolean | null; important: boolean | null; note: string | null; date_created: string | null; date_modified: string | null; path: string | null; extension: string | null; relative_path: string | null; parsed_path: string | null; parsed: boolean | null; indexed: boolean | null; thumbnail_path: string | null; thumbnail: boolean | null; libraryId: string; locationId: string }

export type Library = { id: number; uuid: string; name: string | null; redundancy_goal: number | null; date_created: string | null; date_modified: string | null }

export type CreateNewUserParam = { id: string; name: string }

export type Location = { id: number; uuid: string; name: string | null; path: string; total_capacity: number | null; available_capacity: number | null; is_archived: boolean | null; generate_preview_media: boolean | null; hidden: boolean | null; date_created: string | null; instance_id: number | null; libraryId: number | null }

export type SearchResult = { title: string; snippet: string; score: number; object: Object }

export type CodexNotification = { message: string; notification_type: NotificationType }

export type GetDocById = { id: number }

export type User = { id: string; displayName: string }

export type AddNewLocation = { library_id: string; name: string; path: string; is_archived: boolean; hidden: boolean; date_created: string }

export type Notification = { id: number; read: boolean; data: number; message: string | null; expires_at: string | null }
