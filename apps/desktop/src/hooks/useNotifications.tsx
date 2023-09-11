import { useState } from "react";
import rspc from "../lib/query";
import { v4 as uuidv4 } from "uuid";
import toast from 'react-hot-toast';

import { NotificationType } from "../../../../web/src/bindings";
import { message } from "@tauri-apps/api/dialog";

export interface Notification {
	id: string | number;
	type: "error" | "warning" | "success" | "informational";
	title: string;
	description?: string;
	timestamp: Date;
	unread: boolean;
	onNotificationClick?: () => void;
}

const notificationTypeConverter = (type: NotificationType) => {
	switch (type) {
		case "Info":
			return "informational";
		case "Warning":
			return "warning";
		case "Error":
			return "error";
		case "FileAdded":
			return "success";
		case "FileRemoved":
			return "informational";
		case "FileUpdated":
			return "informational";
		case "LibraryAdded":
			return "success";
		case "LibraryRemoved":
			return "informational";
		case "LibraryUpdated":
			return "informational";
		case "ObjectParsed":
			return "informational";
		case "ObjectAdded":
			return "success";
		case "ObjectRemoved":
			return "informational";
		case "ObjectUpdated":
			return "informational";
		case "ThumbnailGenerated":
			return "informational";
		case "IndexingStarted":
			return "informational";
		case "IndexingFinished":
			return "informational";
		case "IndexingFailed":
			return "error";
		case "SearchStarted":
			return "informational";
		case "SearchFinished":
			return "informational";
		case "SearchFailed":
			return "error";
		case "ParsingError":
			return "error";
		default:
			return "informational";
	}
};

//We also need to convert the types to toast types which are 'success' | 'error' | 'loading' | 'blank' | 'custom';
const toastTypeConverter = (type: NotificationType) => {
	switch (type) {
		case "Info":
			return "blank";
		case "Warning":
			return "blank";
		case "Error":
			return "error";
		case "FileAdded":
			return "success";
		case "FileRemoved":
			return "blank";
		case "FileUpdated":
			return "blank";
		case "LibraryAdded":
			return "success";
		case "LibraryRemoved":
			return "blank";
		case "LibraryUpdated":
			return "blank";
		case "ObjectParsed":
			return "blank";
		case "ObjectAdded":
			return "success";
		case "ObjectRemoved":
			return "blank";
		case "ObjectUpdated":
			return "blank";
		case "ThumbnailGenerated":
			return "blank";
		case "IndexingStarted":
			return "blank";
		case "IndexingFinished":
			return "blank";
		case "IndexingFailed":
			return "error";
		case "SearchStarted":
			return "blank";
		case "SearchFinished":
			return "blank";
		case "SearchFailed":
			return "error";
		case "ParsingError":
			return "error";
		default:
			return "blank";
	}
};


interface useNotificationsProps {
	notificationCallback?: (notification: Notification) => void;
}

const useNotifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [newNotifications, setNewNotifications] = useState(false);
	const notify = (title) => toast(title.title);

	const addNotification = (notification: Notification) => {
		setNotifications((prev) => [...prev, notification]);
		setNewNotifications(true);
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	//Check if there are any unread notifications and return true if there are
	const hasUnreadNotifications = () => {
		return notifications.length > 0;
	};

	const dismissAllNotifications = () => {

		setNotifications((prev) =>
			prev.map((n) => {
				n.unread = false;
				return n;
			}),
		);
		setNotifications([]);
	};

	const dismissNotification = (id: string) => {
		setNotifications((prev) =>
			prev.map((n) => {
				if (n.id === id) {
					n.unread = false;
				}
				return n;
			}),
		);
	};

	rspc.useSubscription(["notifications.listen"], {
		onData: (payload) => {
			const id = uuidv4();
			notify({ title: payload.message, type: toastTypeConverter(payload.notification_type)});
			addNotification({
				id: id,
				type: notificationTypeConverter(payload.notification_type),
				title: payload.message,
				description: payload.message,
				timestamp: new Date(Date.now()),
				unread: true,
				onNotificationClick: () => {
					removeNotification(id);
				},
			});
		},
	});

	return {
		notifications,
		dismissAllNotifications,
		dismissNotification,
		removeNotification,
		hasUnreadNotifications,
		newNotifications,
	};
};

export default useNotifications;
