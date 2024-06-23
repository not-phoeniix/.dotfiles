const audio = await Service.import("audio");
const hyprland = await Service.import("hyprland");
const battery = await Service.import("battery");

import { IsVertical, VolumeIcon, BatteryIcon } from "./bar.js";

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
})

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
    visible: battery.bind("available"),
    child: Widget.Box({
        spacing: 4,
        hpack: "center",
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
                className: "description"
            })
        ]
    })
})

// #endregion

const VolumeBar = Widget.Box({
    className: "widget",
    vertical: false,
    spacing: 16,
    children: [
        VolumeIcon(),
        Widget.LevelBar({
            widthRequest: 400
        }).hook(audio.speaker, (self) => {
            self.value = audio.speaker.volume;
        })
    ]
});

// #region Session buttons

const DoubleClickButton = (label, onExecute = () => { }, className = "widget", tmpClickedClassName = "widget alert") => Widget.Button({
    className: className,
    label: label,
    setup: (self) => {
        let isClicked = false;
        self.onClicked = () => {
            if (isClicked) {
                onExecute();
                isClicked = false;
                self.className = className;
            } else {
                isClicked = true;
                self.className = tmpClickedClassName;
            }
        };

        self.onHoverLost = () => {
            isClicked = false
            self.className = className;
        };
    }
});

const WidgetSpacing = 10;

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

const CtrlWidgets = Widget.Box({
    vertical: true,
    spacing: WidgetSpacing,
    children: [
        Widget.Label({ label: "girl panel" }),
        Widget.Box({
            spacing: WidgetSpacing,
            vertical: false,
            homogeneous: true,
            children: [
                RestartAgsButton,
                ChangeVerticalityButton,
                ShowGuysButton
            ]
        }),
        VolumeBar,
        Widget.Box({
            spacing: WidgetSpacing,
            vertical: false,
            homogeneous: true,
            children: [
                BatteryStatus,
                SessionButtons
            ]
        })
    ]
});

// #region Window itself

export const QuickSettings = Widget.Window({
    monitor: 0,
    name: "quick_settings",
    anchor: ["top", "left"],
    child: Widget.Box({
        spacing: 20,
        homogeneous: true,
        vertical: IsVertical.bind(),
        className: "panel",
        css: "margin: 10px",
        children: [
            CtrlWidgets
        ]
    })
});

// #endregion
