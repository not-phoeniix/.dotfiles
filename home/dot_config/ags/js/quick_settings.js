//
// quick settings panel file !!
//

const audio = await Service.import("audio");
const battery = await Service.import("battery");
const network = await Service.import("network");
const bluetooth = await Service.import("bluetooth");
import brightness from "./brightness.js";

import { IsVertical, VolumeIcon, BatteryIcon, NetworkIcon, BluetoothIcon } from "./bar.js";

const WidgetSpacing = 10;

// #region Main Page

// #region Big buttons

const BigButton = (onClicked = () => { }, onMiddleClicked = () => { }, mainLabel, descLabel) => Widget.Button({
    className: "widget",
    onClicked: onClicked,
    onMiddleClick: onMiddleClicked,
    heightRequest: 120,
    widthRequest: 200,
    child: Widget.Box({
        vertical: true,
        spacing: 6,
        vpack: "center",
        children: [
            mainLabel,
            descLabel
        ]
    }),
    setup: () => {
        descLabel.toggleClassName("description", true);
        descLabel.maxWidthChars = 50;
        descLabel.wrap = true;
    }
});

// network big button
const Network = () => BigButton(
    () => network.toggleWifi(),
    () => Utils.execAsync("nm-connection-editor"),
    NetworkIcon(),
    Widget.Label().hook(network, (self) => {
        self.label = `${network.wifi.internet}: ${network.wifi.ssid}`;
        self.visible = network.primary == "wifi" && network.wifi.enabled;
    })
).hook(network.wifi, (self) => {
    self.toggleClassName("enabled", network.wifi.enabled);
}, "notify::enabled");

// bluetooth big button
const Bluetooth = () => BigButton(
    () => bluetooth.toggle(),
    () => Utils.execAsync("blueman-manager"),
    BluetoothIcon(),
    Widget.Label({
        label: bluetooth.bind("connected_devices").as(d => d[0]?.name || ""),
        visible: bluetooth.bind("connected_devices").as(d => d.length > 0)
    })
).hook(bluetooth, (self) => {
    self.toggleClassName("enabled", bluetooth.enabled);
}, "notify::enabled");

// toggle IsVertical button
const ChangeVerticalityButton = () => BigButton(
    () => IsVertical.value = !IsVertical.value,
    () => {},
    Widget.Label({ label: IsVertical.bind().as(v => v ? "󱔓" : "󱂪") }),
    Widget.Label({ label: IsVertical.bind().as(v => v ? "make horiz" : "make vert") }),
);

const QuitAgsButton = () => BigButton(
    () => Utils.exec(`pkill ags`),
    () => {},
    Widget.Label(""),
    Widget.Label("kill AGS")
);

const BigRow = (children = []) => Widget.Box({
    homogeneous: true,
    spacing: WidgetSpacing,
    children: children
});

const BigButtons = Widget.Box({
    homogeneous: true,
    vertical: true,
    spacing: WidgetSpacing,
    children: [
        BigRow([Network(), Bluetooth()]),
        BigRow([QuitAgsButton(), ChangeVerticalityButton()])
    ]
});

// #endregion

// #region Level bars

const VolumeBar = Widget.Box({
    className: "widget",
    vertical: false,
    spacing: 16,
    children: [
        VolumeIcon(),
        Widget.LevelBar({
            hexpand: true,
        }).hook(audio.speaker, self => {
            self.value = audio.speaker.volume;
        })
    ]
});

const BrightnessBar = Widget.Box({
    className: "widget",
    vertical: false,
    spacing: 16,
    children: [
        Widget.Label("󰃠"),
        Widget.LevelBar({
            hexpand: true,
        }).hook(brightness, self => {
            self.value = brightness.screen_value;
        })
    ]
});

// #endregion

// #region Session buttons

function secToHourMin(seconds) {
    const hour = Math.floor(seconds / 3600);
    const min = Math.floor(seconds / 60) % 60;
    const min0 = min < 10 ? "0" : "";
    return `${hour}:${min0}${min}`;
}

const BatteryStatus = Widget.Button({
    onClicked: () => Utils.exec("notify-send \"battery noise\" \"mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm\""),
    visible: battery.bind("available"),
    widthRequest: 150,
    child: Widget.Box({
        spacing: 10,
        hpack: "center",
        vpack: "center",
        vertical: false,
        children: [
            Widget.Box({
                hpack: "center",
                spacing: 5,
                children: [
                    BatteryIcon(),
                    Widget.Label({ label: battery.bind("percent").as(p => `${p}%`) })
                ]
            }),
            Widget.Label({
                label: battery.bind("time_remaining").as(r =>
                    secToHourMin(r) + (battery.charging ? " till charged" : " remaining")
                ),
                className: "description",
                visible: battery.bind("percent").as(p => p < 100)
            })
        ]
    })
});

const SessionButtons = Widget.Box({
    spacing: WidgetSpacing,
    vertical: false,
    className: "widget nobg",
    children: [
        BatteryStatus,

        // expanding separator
        Widget.Box({ hexpand: true }),

        // config button
        Widget.Button({
            label: "",
            className: "smoltext",
            onClicked: () => App.openWindow("desktop_cfg")
        }),

        // session exit button
        Widget.Button({
            label: "⏻",
            className: "smoltext",
            onClicked: () => App.openWindow("session_popup")
        })
    ]
});

// #endregion

const MainPage = Widget.Box({
    vertical: true,
    spacing: WidgetSpacing,
    children: [
        BigButtons,
        BrightnessBar,
        VolumeBar,
        SessionButtons
    ]
});

// #endregion

// #region Network Page

const NetworkPage = Widget.Box({
    children: [
        Widget.Label("hi hi net page :3")
    ]
});

// #endregion

// #region Window itself

export const QuickSettings = Widget.Window({
    monitor: 0,
    name: "quick_settings",
    keymode: "on-demand",
    anchor: IsVertical.bind().as(v => v ? ["bottom", "left"] : ["top", "right"]),
    child: Widget.Box({
        className: "panel",
        css: "margin: 10px;",
        children: [
            Widget.Stack({
                children: {
                    "main": MainPage,
                    "net": NetworkPage
                },
                shown: "main"
            })
        ]
    })
}).keybind("Escape", () => App.closeWindow("quick_settings"));

// #endregion
