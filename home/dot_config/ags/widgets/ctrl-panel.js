import { IsVertical } from "./bar";

const BarWidgets = Widget.Box({
});

const VertAnchor = ["bottom", "left"];
const HorizAnchor = ["top", "right"];

export const CtrlPanel = (monitor = 0) => Widget.Window({
    monitor,
    name: `ctrl_panel${monitor}`,
    anchor: IsVertical.bind().as(v => v ? VertAnchor : HorizAnchor),
    exclusivity: "normal",
    child: Widget.Box({
        spacing: 20,
        homogeneous: true,
        vertical: IsVertical.bind(),
        className: "panel",
        css: "border-radius: 0px;",
        children: [
            BarWidgets
        ]
    })
});