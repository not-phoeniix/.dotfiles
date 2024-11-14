const { query } = await Service.import("applications");

import { DesktopUnobstructed } from "./variables.js";

// savable variables:
const Location = Variable("bottom");
const IconSize = Variable(60);
const Monitor = Variable(0);
const Apps = Variable([]);

// showing dock variables
const Hovered = Variable(false);
const IsVisible = Utils.derive([DesktopUnobstructed, Hovered], (u, h) => u || h);
const DrawBg = Utils.derive([DesktopUnobstructed, Hovered], (u, h) => !u && h);

const AppButton = (app) => Widget.Button({
    child: Widget.Icon({ icon: app.iconName || "", size: IconSize.bind() }),
    onClicked: () => {
        App.closeWindow("app_launcher");
        app.launch();
    },
    attribute: { app },
    tooltipText: app.name
});

const AppsBox = Widget.Box({
    spacing: 10,
    vertical: Location.bind().as(l => l == "right" || l == "left"),
    visible: IsVisible.bind(),
    children: Apps.bind().as(a => a.map(appName => AppButton(query(appName)[0])))
});

const HoverTrig = Widget.EventBox({
    onHover: () => Hovered.value = true,
    setup: self => self.poll(4000, () => {
        // poll every 4 seconds to check if mouse is still hovered
        //   if not, change the variable to reflect that lol
        if (!self.is_focus && Hovered.value == true) {
            Hovered.value = false;
        }
    }),

    child: Widget.Box({
        className: DrawBg.bind().as(d => IsVisible.value ? d ? "panel" : "panel nobg" : ""),
        css: "margin: 10px;",
        heightRequest: Location.bind().as(l => l == "left" || l == "right" ? 300 : 0),
        widthRequest: Location.bind().as(l => l == "left" || l == "right" ? 0 : 300),
        child: AppsBox
    })
});

export const Dock = Widget.Window({
    monitor: Monitor.bind(),
    name: "dock",
    anchor: Location.bind().as(l => [l]),
    child: HoverTrig
});

export function GetDockSettings() {
    return {
        monitor: Monitor.value,
        apps: Apps.value,
        location: Location.value,
        iconSize: IconSize.value
    };
}

export function LoadDockSettings(obj) {
    if (obj) {
        Monitor.value = obj.monitor || 0;
        Apps.value = obj.apps ?? [];
        Location.value = obj.location || "bottom";
        IconSize.value = obj.iconSize || 60;
    }
}