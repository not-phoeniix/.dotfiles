//
// session logout/lock/exit screen :]]
//

const hyprland = await Service.import("hyprland");
const wallpaper = Utils.exec(`bash -c "cat $XDG_CACHE_HOME/wal/wal"`);

const SessionButton = (label, icon, command = () => { }) => Widget.Button({
    onClicked: command,
    child: Widget.Box({
        vertical: true,
        spacing: 10,
        className: "widget nobg",
        children: [
            Widget.Label({ label: icon, className: "header" }),
            Widget.Label({ label: label, className: "sub-header accent" }),
        ]
    })
});

const Buttons = Widget.Box({
    className: "logout-panel",
    child: Widget.Box({
        hexpand: true,
        vexpand: true,
        hpack: "center",
        vpack: "center",
        spacing: 30,
        children: [
            SessionButton("poweroff", "⏻", () => Utils.exec("sudo poweroff")),
            SessionButton("reboot", "", () => Utils.exec("sudo reboot")),
            SessionButton("logout", "󰍃", () => hyprland.messageAsync("dispatch exit")),
        ]
    })
})

export const SessionPopup = Widget.Window({
    monitor: 0,
    name: "session_popup",
    anchor: ["top", "bottom", "right", "left"],
    layer: "overlay",
    keymode: "on-demand",
    child: Widget.Box({
        vertical: false,
        className: "logout-bg",
        css: `background-image: url("${wallpaper}")`,
        child: Buttons
    }),
})
    .keybind("Escape", () => App.closeWindow("session_popup"))
    .hook(App, (self, windowName, visible) => {
        if (windowName == "session_popup") {
            if (visible) {
                App.closeWindow("bar0");
                App.closeWindow("quick_settings");
                App.closeWindow("dashboard");
            } else {
                App.openWindow("bar0");
            }
        }
    }, "window-toggled");
