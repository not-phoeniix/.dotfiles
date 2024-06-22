const audio = await Service.import("audio");
const hyprland = await Service.import("hyprland");

import { IsVertical, VolumeIcon } from "./bar.js";

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

const VolumeBar = Widget.Box({
    className: "widget",
    vertical: false,
    spacing: 16,
    children: [
        VolumeIcon(),
        Widget.LevelBar({
            widthRequest: 300
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
        SessionButtons
    ]
});

// #region Window itself

const VertAnchor = ["bottom", "left"];
const HorizAnchor = ["top", "right"];

export const CtrlPanel = Widget.Window({
    monitor: 0,
    name: "ctrl_panel",
    anchor: IsVertical.bind().as(v => v ? VertAnchor : HorizAnchor),
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
