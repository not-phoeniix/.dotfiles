const audio = await Service.import("audio");
const hyprland = await Service.import("hyprland");
const battery = await Service.import("battery");
const network = await Service.import("network");
const bluetooth = await Service.import("bluetooth");

import { IsVertical, VolumeIcon, BatteryIcon, NetworkIcon, BluetoothIcon } from "./bar.js";

const WidgetSpacing = 10;

// #region Big buttons

const BigButton = (onClicked = () => { }, mainLabel, descLabel) => Widget.Button({
    className: "widget",
    onClicked: onClicked,
    heightRequest: 100,
    child: Widget.Box({
        vertical: true,
        spacing: 6,
        vpack: "center",
        children: [
            mainLabel,
            descLabel
        ]
    })
});

// network big button
const Network = () => BigButton(
    () => network.toggleWifi(),
    NetworkIcon(),
    Widget.Label({ className: "description" }).hook(network, (self) => {
        self.label = `${network.wifi.internet}: ${network.wifi.ssid}`;
        self.visible = network.primary == "wifi" && network.wifi.enabled;
    })
).hook(network.wifi, (self) => {
    self.toggleClassName("enabled", network.wifi.enabled);
}, "notify::enabled");

// bluetooth big button
const Bluetooth = () => BigButton(
    () => bluetooth.toggle(),
    BluetoothIcon(),
    Widget.Label({
        label: "device",
        visible: bluetooth.bind("connected_devices").as(d => d.length > 0)
    })
).hook(bluetooth, (self) => {
    self.toggleClassName("enabled", bluetooth.enabled);
}, "notify::enabled");

// collection of all big buttons
const BigButtons = Widget.Box({
    homogeneous: true,
    vertical: true,
    spacing: WidgetSpacing,
    children: [
        Widget.Box({
            homogeneous: true,
            spacing: WidgetSpacing,
            children: [
                Network(),
                Bluetooth()
            ]
        }),
    ]
})

// #endregion

const Profile = Widget.Box({
    vertical: false,
    className: "widget nobg",
    spacing: WidgetSpacing,
    children: [
        Widget.Box({
            widthRequest: 70,
            heightRequest: 70,
            css: `
                background-image: url("${App.configDir}/pfp.png");
                background-size: 100%;
                border-radius: 100px;
            `
        }),
        Widget.Box({
            vertical: true,
            spacing: 10,
            hexpand: true,
            vpack: "center",
            children: [
                Widget.Label("Phoenix :D")
            ]
        })
    ]
});

// #region Smaller buttons

const ChangeVerticalityButton = Widget.Button({
    label: IsVertical.bind().as(v => v ? "󱔓" : "󱂪"),
    className: "widget",
    onClicked: () => IsVertical.value = !IsVertical.value
});

const RestartAgsButton = Widget.Button({
    label: "",
    className: "widget",
    onClicked: () => Utils.exec(App.configDir + "/open.sh")
});

const ShowGuysButton = Widget.Button({
    label: "",
    className: "widget",
    onClicked: () => App.toggleWindow("freaking_guys")
});

// #endregion

// #region Battery 

function secToHourMin(seconds) {
    const hour = Math.floor(seconds / 3600);
    const min = Math.floor(seconds / 60) % 60;
    const min0 = min < 10 ? "0" : "";
    return `${hour}:${min0}${min}`;
}

const BatteryStatus = Widget.Button({
    className: "widget",
    onClicked: () => Utils.exec("notify-send \"battery noise\" \"mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm\""),
    visible: battery.available,
    widthRequest: 150,
    heightRequest: 90,
    child: Widget.Box({
        spacing: 4,
        hpack: "center",
        vpack: "center",
        vertical: true,
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
})

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
        }).hook(audio.speaker, (self) => {
            self.value = audio.speaker.volume;
        })
    ]
});

// TODO: brightness bar :]
const BrightnessBar = Widget.Box({
    // className: "widget",
    // vertical: false,
    // spacing: 16,
    // children: [
    //     VolumeIcon(),
    //     Widget.LevelBar({
    //         hexpand: true,
    //     }).hook(audio.speaker, (self) => {
    //         self.value = audio.speaker.volume;
    //     })
    // ]
})

// #endregion

// #region Session buttons

const DoubleClickButton = (label, onExecute = () => { }) => Widget.Button({
    className: "widget",
    label: label,
    setup: (self) => {
        let isClicked = false;
        self.onClicked = () => {
            if (isClicked) {
                onExecute();
                isClicked = false;
            } else {
                isClicked = true;
            }

            self.toggleClassName("alert", isClicked);
        };

        self.onHoverLost = () => {
            isClicked = false
            self.toggleClassName("alert", false);
        };
    }
});

const SessionButtons = Widget.Box({
    spacing: WidgetSpacing,
    vertical: false,
    homogeneous: true,
    children: [
        DoubleClickButton("󰍃", () => hyprland.messageAsync("dispatch exit")),
        DoubleClickButton("", () => Utils.exec("sudo reboot")),
        DoubleClickButton("⏻", () => Utils.exec("sudo poweroff")),
    ]
});

// #endregion

const ConfigButton = Widget.Button({
    className: "widget nobg",
    label: "",
    onClicked: () => App.openWindow("config_window")
})

const CtrlWidgets = Widget.Box({
    vertical: true,
    spacing: WidgetSpacing,
    children: [
        Widget.Box({
            children: [
                Widget.Label({
                    className: "widget",
                    css: "background-color: transparent;",
                    label: "girl panel™",
                    hexpand: true
                }),
                ConfigButton
            ]
        }),

        BigButtons,

        Widget.Box({
            spacing: WidgetSpacing,
            children: [
                Widget.Box({
                    spacing: WidgetSpacing,
                    homogeneous: true,
                    hexpand: true,
                    children: [
                        RestartAgsButton,
                        ChangeVerticalityButton,
                        ShowGuysButton,
                    ]
                }),
                BatteryStatus
            ]
        }),

        VolumeBar,

        Widget.Box({
            spacing: WidgetSpacing,
            vertical: false,
            homogeneous: true,
            children: [
                Profile,
                SessionButtons
            ]
        })
    ]
});

// #region Window itself

const anchorVert = ["bottom", "left"];
const anchorHoriz = ["top", "right"];

export const QuickSettings = Widget.Window({
    monitor: 0,
    name: "quick_settings",
    anchor: IsVertical.bind().as(v => v ? anchorVert : anchorHoriz),
    child: Widget.Box({
        className: "panel",
        css: "margin: 10px",
        children: [
            CtrlWidgets
        ]
    })
});

// #endregion
