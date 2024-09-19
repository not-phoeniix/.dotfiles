const notifications = await Service.import("notifications");

notifications.popupTimeout = 5000;
notifications.clearDelay = 200;
notifications.forceTimeout = true;
notifications.cacheActions = false;

const NotifIcon = ({ app_entry, app_icon, image }) => {
    if (image) {
        const imgSize = 75;
        return Widget.Box({
            className: "notif-icon",
            css: `background-image: url("${image}");
                  background-size: contain;
                  background-repeat: no-repeat;
                  min-width: ${imgSize}px;
                  min-height: ${imgSize}px;`,
        });
    }

    let icon = "dialog-information-symbolic";

    if (Utils.lookUpIcon(app_icon)) {
        icon = app_icon;
    }

    if (app_entry && Utils.lookUpIcon(app_entry)) {
        icon = app_entry;
    }

    return Widget.Box({
        className: "notif-icon",
        child: Widget.Icon(icon)
    });
}

const Notif = (n, width = 300) => {
    const icon = NotifIcon(n);

    const title = Widget.Label({
        label: n.summary,
        className: "notif-title",
        justification: "left",
        xalign: 0,
        truncate: "end",
    });

    const body = Widget.Label({
        label: n.body,
        className: "notif-body",
        justification: "left",
        xalign: 0,
        wrap: true
    });

    const actions = Widget.Box({
        spacing: 10,
        children: n.actions.map(({ id, label }) => Widget.Button({
            child: Widget.Label({ label, truncate: "end" }),
            onClicked: () => {
                n.invoke(id);
                n.dismiss();
            },
            hexpand: true,
            className: "widget notif-action",
        }))
    });

    return Widget.EventBox({
        attribute: { id: n.id },
        onSecondaryClick: n.dismiss,
        child: Widget.Box({
            vertical: true,
            className: "panel",
            spacing: 10,
            widthRequest: width,
            children: [
                // main notif body
                Widget.Box({
                    spacing: 15,
                    className: "widget",
                    children: [
                        icon,

                        // title and body
                        Widget.Box({
                            vertical: true,
                            vpack: "center",
                            spacing: 5,
                            children: [title, body]
                        })
                    ]
                }),

                // actions
                actions
            ]
        })
    })
}

export const Notifications = ({ width = 200, maxNotifs = 5, monitor = 0 }) => {
    const list = Widget.Box({
        vertical: true,
        spacing: 10,
        css: `min-width: ${width}px; min-height: 2px; margin: 10px;`,
        children: notifications.popups.map(n => Notif(n, width))
    });

    function onNotified(_, id) {
        const n = notifications.getNotification(id);
        if (n) {
            list.children = [Notif(n, width), ...list.children]
            if (list.children.length > maxNotifs) {
                list.children = list.children.slice(0, maxNotifs)
            }
        }
    }

    function onDismissed(_, id) {
        list.children.find(n => n.attribute.id === id)?.destroy();
    }

    function onClosed(_, id) {
        list.children.find(n => n.attribute.id === id)?.destroy();
    }

    list.hook(notifications, onNotified, "notified");
    list.hook(notifications, onDismissed, "dismissed");
    list.hook(notifications, onClosed, "closed");

    return Widget.Window({
        monitor,
        name: `notifications${monitor}`,
        anchor: ["top", "right"],
        layer: "overlay",
        child: list
    });
}

globalThis.clearNotifs = () => {
    for (let notif of notifications.notifications) {
        notif.dismiss();
    }
    print("notifs cleared!");
};
