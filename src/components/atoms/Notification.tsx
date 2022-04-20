import { useState, useRef, useEffect } from 'react';
import * as Notifications from "expo-notifications";
import { Subscription } from 'expo-modules-core';

async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);


    Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        //@ts-ignore
        sound: false,
        lightColor: "#FF231F7C",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
    });

    return token;
}

export default function Notification() {
    const [expoPushToken, setExpoPushToken] = useState("");
    const [notification, setNotification] = useState();
    const notificationListener = useRef<Subscription>();
    const responseListener = useRef<Subscription>();

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) =>
            setExpoPushToken(token)
        );

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                //@ts-ignore
                setNotification(notification);
            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                console.log(response);
            });

        return () => {
            Notifications.removeNotificationSubscription(
                notificationListener.current
            );
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    return (
        null
    );
}

export const schedulePushNotification = async (title, date) => {
    return await Notifications.scheduleNotificationAsync({
        content: {title, sound: false},
        trigger: date
    });
}

export const cancelNotification = async (notifId) => {
    await Notifications.cancelScheduledNotificationAsync(notifId);
}
