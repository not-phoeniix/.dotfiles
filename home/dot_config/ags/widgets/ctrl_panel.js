const audio = await Service.import("audio");

import { IsVertical, VolumeIcon } from "./bar.js";

const ChangeVerticalityButton = Widget.Button({
    label: IsVertical.bind().as(v => v ? "󱔓" : "󱂪"),
    className: "widget",
    onClicked: () => IsVertical.value = !IsVertical.value
});

const RestartAgsButton = Widget.Button({
    label: "",
    className: "widget",
    onClicked: () => Utils.exec(App.configDir + "/open.sh")
});

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
})

const WidgetSpacing = 10;

const CtrlWidgets = Widget.Box({
    vertical: true,
    spacing: WidgetSpacing,
    // homogeneous: true,
    children: [
        Widget.Label({ label: "ctrl panel :3" }),
        Widget.Box({
            spacing: WidgetSpacing,
            vertical: false,
            homogeneous: true,
            children: [
                RestartAgsButton,
                ChangeVerticalityButton,
            ]
        }),
        VolumeBar
    ]
});

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
