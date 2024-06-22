import { IsVertical } from "./bar.js";

const ChangeVerticalityButton = Widget.Button({
    onClicked: () => {
        IsVertical.value = !IsVertical.value;
    },
    label: IsVertical.bind().as(v => v ? "󱔓" : "󱂪"),
    className: "widget"
});

const RestartAgsButton = Widget.Button({
    onClicked: () => Utils.exec(App.configDir + "/open.sh"),
    label: "",
    className: "widget"
});

const CtrlWidgets = Widget.Box({
    vertical: true,
    homogeneous: true,
    children: [
        Widget.Label({ label: "ctrl panel :3" }),
        Widget.Box({
            vertical: false,
            homogeneous: true,
            children: [
                RestartAgsButton,
                ChangeVerticalityButton,
            ]
        })
    ]
});

const VertAnchor = ["bottom", "left"];
const HorizAnchor = ["top", "right"];

export const CtrlPanel = (monitor = 0) => Widget.Window({
    monitor,
    name: "ctrl_panel",
    anchor: IsVertical.bind().as(v => v ? VertAnchor : HorizAnchor),
    // exclusivity: "normal",
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