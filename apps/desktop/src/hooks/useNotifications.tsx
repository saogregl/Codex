import { useState } from "react";
import rspc from "../lib/query";
import { v4 as uuidv4 } from "uuid";

import { NotificationType } from "../../../../web/src/bindings";

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

const useNotifications = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [newNotifications, setNewNotifications] = useState(false);

	const addNotification = (notification: Notification) => {
		setNotifications((prev) => [...prev, notification]);
		setNewNotifications(true);
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	//Check if there are any unread notifications and return true if there are
	const hasUnreadNotifications = () => {
		console.log(notifications)
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
			addNotification({
				id: id,
				type: notificationTypeConverter(payload.notification_type),
				title: payload.message,
				description: payload.message,
				timestamp: new Date(),
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
