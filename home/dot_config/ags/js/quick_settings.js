//
// quick settings panel file !!
//

const audio = await Service.import("audio");
const battery = await Service.import("battery");
const network = await Service.import("network");
const bluetooth = await Service.import("bluetooth");
const hyprland = await Service.import("hyprland");
import brightness from "./brightness.js";

import { IsVertical, VolumeIcon, BatteryIcon, NetworkIcon, BluetoothIcon } from "./bar.js";

const WidgetSpacing = 10;

// #region Main Page

// #region Big buttons

const BigButton = (
    onClicked = () => { },
    onMiddleClicked = () => { },
    onRightClicked = () => { },
    mainLabel,
    descLabel
) => {
    descLabel.toggleClassName("description", true);
    descLabel.maxWidthChars = 50;
    descLabel.wrap = true;

    const subLabels = Widget.Box({
        vertical: true,
        spacing: 6,
        vpack: "center",
        children: [
            mainLabel,
            descLabel
        ]
    });

    return Widget.Button({
        className: "widget",
        onClicked: onClicked,
        onMiddleClick: onMiddleClicked,
        onSecondaryClick: onRightClicked,
        heightRequest: 120,
        widthRequest: 200,
        child: subLabels
    });
};

// network big button
const Network = () => BigButton(
    () => network.toggleWifi(),
    () => Utils.execAsync("nm-connection-editor"),
    () => {
        PageStack.shown = "net";
        network.wifi.scan();
    },
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
    () => PageStack.shown = "bluetooth",
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
    undefined,
    undefined,
    Widget.Label({ label: IsVertical.bind().as(v => v ? "󱔓" : "󱂪") }),
    Widget.Label({ label: IsVertical.bind().as(v => v ? "make horiz" : "make vert") }),
);

const QuitAgsButton = () => BigButton(
    () => Utils.exec(`pkill ags`),
    undefined,
    undefined,
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

// #region Bottom buttons

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

const BottomButtons = Widget.Box({
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

        // session popup button
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
        BottomButtons
    ]
});

// #endregion

const TitleBar = (pageName = "[page]") => Widget.Box({
    className: "widget",
    vexpand: false,
    children: [
        Widget.Button({
            label: "",
            hexpand: false,
            onClicked: () => PageStack.shown = "main"
        }),
        Widget.Label({
            label: pageName,
            hexpand: true
        })
    ]
})

// #region Network Page

const AccessPoint = (accessPoint) => Widget.Button({
    onClicked: () => Utils.execAsync(`nmcli connection up "${accessPoint.ssid}"`),
    child: Widget.Box({
        children: [
            // Widget.Label({
            //     label: "h",
            //     setup: self => {
            //         const icons = ["󰤯", "󰤟", "󰤢", "󰤥", "󰤨"];
            //         const index = Math.floor(accessPoint.strength / 100 * (icons.length - 1));
            //         self.label = icons[index];
            //     }
            // }),
            Widget.Label(accessPoint.ssid)
        ]
    })
});

const NetworkPage = Widget.Box({
    spacing: 10,
    vertical: true,
    children: [
        TitleBar("network"),
        Widget.Scrollable({
            className: "widget",
            hscroll: "never",
            vexpand: true,
            child: Widget.Box({
                vertical: true,
                children: network.wifi.bind("access_points").as(a => {
                    // sort based on strength, higher at the front (hopefully)
                    a.sort((one, two) => two.strength - one.strength);

                    // remove duplicate ssid's
                    let existing = [];
                    a.filter((network) => {
                        if (!existing.includes(network.ssid)) {
                            existing.push(network.ssid);
                            return true;
                        }

                        return false;
                    });

                    return a.map(AccessPoint)
                })
            })
        })
    ]
});

// #endregion

// #region Bluetooth Page

const BluetoothPage = Widget.Box({
    spacing: 10,
    vertical: true,
    children: [
        TitleBar("bluetooth"),
        Widget.Box({
            className: "widget",
            vexpand: true
        })
    ]
});

// #endregion

// #region Window itself

const PageStack = Widget.Stack({
    children: {
        "main": MainPage,
        "net": NetworkPage,
        "bluetooth": BluetoothPage
    },
    shown: "main"
});

export const QuickSettings = Widget.Window({
    monitor: 0,
    name: "quick_settings",
    keymode: "on-demand",
    anchor: IsVertical.bind().as(v => v ? ["bottom", "left"] : ["top", "right"]),
    child: Widget.Box({
        className: "panel",
        css: "margin: 10px;",
        child: PageStack
    })
})
    .keybind("Escape", () => App.closeWindow("quick_settings"))
    .hook(App, (_, windowName, visible) => {
        if (windowName == "quick_settings" && visible) {
            PageStack.shown = "main";
        }
    }, "window-toggled");

// #endregion
