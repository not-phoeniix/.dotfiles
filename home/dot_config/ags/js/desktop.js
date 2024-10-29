const hyprland = await Service.import("hyprland");

import { Hour, HourMilit, Minute } from "./variables.js";

const Name = Variable("[name]");
const SquareSize = Variable(250);
const SquareSpacing = Variable(20);

const DigitalClock = Widget.CenterBox({
    className: "panel digital-clock",
    widthRequest: SquareSize.bind(),
    heightRequest: SquareSize.bind(),
    centerWidget: Widget.Box({
        spacing: 10,
        children: [
            Widget.Label({ label: Hour.bind(), }),
            Widget.Label({ label: Minute.bind(), className: "accent" })
        ]
    })
});

const Greeter = Widget.CenterBox({
    className: "panel greeter",
    vertical: true,
    widthRequest: SquareSize.bind(),
    heightRequest: SquareSize.bind(),
    centerWidget: Widget.Box({
        spacing: 5,
        vertical: true,
        children: [
            Widget.Label({
                label: Name.bind().as(n => `Hello ${n} !!`),
                className: "greet-name"
            }),
            Widget.Label({
                className: "greet-time accent",
                label: HourMilit.bind().as(h => {
                    let hour = Number(h);
                    let time = "";
                    if (hour >= 22 || hour <= 3) {
                        // between 10pm and 3am, "night"
                        time = "Night";
                    } else if (hour >= 16) {
                        // >= 6pm, "evening"
                        time = "Evening";
                    } else if (hour >= 12) {
                        // >=noon, "afternoon"
                        time = "Afternoon";
                    } else {
                        // otherwise, "morning"
                        time = "Morning";
                    }

                    return `Good ${time} :]`
                })
            })
        ]
    })
});

const WidgetCollection = Widget.Box({
    vpack: "start",
    hpack: "start",
    css: "margin: 40px;",
    spacing: SquareSpacing.bind(),
    vertical: true,
    children: [
        Widget.Box({
            spacing: SquareSpacing.bind(),
            children: [
                DigitalClock,
                Greeter
            ]
        }),
    ]
});

export const DesktopWidgets = Widget.Window({
    monitor: 0,
    name: `desktop_widgets`,
    anchor: ["top", "bottom", "right", "left"],
    layer: "bottom",
    child: WidgetCollection,
    setup: self => {
        const Visible = Variable(false);

        function UpdateUnobstructed() {
            // make desktop widgets visible when either the focused client 
            //   is floating or the active workspace is empty
            const currentWorkspace = hyprland.getWorkspace(hyprland.active.workspace.id);

            // check if ANY clients are tiled
            let allAreFloating = true;
            for (let client of hyprland.clients) {
                const sameWorkspace = client.workspace.id == currentWorkspace?.id;
                const isFloating = client.floating;
                if (sameWorkspace && !isFloating) {
                    allAreFloating = false;
                    break;
                }
            }

            // only update value if any of this is happening on the correct monitor
            if (hyprland.active.monitor.id == 0) {
                Visible.value = currentWorkspace?.windows == 0 || allAreFloating;
            }
        }

        // hook object's visible property to change whenever 
        //   the const Visible variable changes, and hook the
        //   updating function to trigger whenver hyprland updates
        self.hook(Visible, () => self.visible = Visible.value);
        self.hook(hyprland, UpdateUnobstructed);
    }
});

export function GetDesktopSettings() {
    return {
        name: Name.value,
        squareSize: SquareSize.value,
        squareSpacing: SquareSpacing.value
    };
}

export function LoadDesktopSettings(obj) {
    if (obj) {
        Name.value = obj.name ?? "[name]";
        SquareSize.value = obj.squareSize ?? 250;
        SquareSpacing.value = obj.squareSpacing ?? 20;
    }
}