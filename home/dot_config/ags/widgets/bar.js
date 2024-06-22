//
// taskbar file :]
//

const hyprland = await Service.import("hyprland");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");
const audio = await Service.import("audio");

import { Hour, Minute } from "../variables.js"

export const IsVertical = Variable(false);

// change hyprland animation when variable changes
IsVertical.connect("changed", () => {
    const style = IsVertical.value ? "slidevert" : "slidehoriz";
    hyprland.messageAsync("keyword animation workspaces,1,3,default," + style);
});

// #region Workspaces

const WorkspaceIcon = (workspace, hideIfNotExist = false, icon = "") => Widget.Button({
    attribute: workspace,
    onClicked: () => hyprland.messageAsync(`dispatch workspace ${workspace}`),
    setup: (self) => self.hook(hyprland, () => {
        const wsFocused = hyprland.active.workspace.id === workspace;
        const workspaceExists = hyprland.workspaces.some((ws => ws.id === workspace));

        self.className = "workspace container " + (wsFocused ? "focused" : "");

        self.label = workspaceExists ? "" : "";
        if (icon != "") self.label = icon;

        if (hideIfNotExist) {
            self.visible = workspaceExists;
        }
    })
});

const WorkspacesMain = Widget.Box({
    className: "widget",
    vertical: IsVertical.bind(),
    children: Array.from({ length: 5 }, (_, i) => i + 1)
        .map(i => WorkspaceIcon(i))
});

const WorkspacesSpecial = Widget.Box({
    className: "widget",
    css: "background-color: transparent;",
    vertical: IsVertical.bind(),
    spacing: 5,
    children: [
        WorkspaceIcon(6, true, ""),
        WorkspaceIcon(7, true, ""),
        WorkspaceIcon(8, true, ""),
    ]
});

// #endregion

// #region SysTray

const SysTrayItem = (item) => Widget.Button({
    child: Widget.Icon({ size: 25 }).bind("icon", item, "icon"),
    tooltipMarkup: item.bind("tooltip_markup"),
    onPrimaryClick: (_, event) => item.activate(event),
    onSecondaryClick: (_, event) => item.openMenu(event)
});

const SysTray = Widget.Box({
    className: "widget",
    // css: "padding: 0px;", 
    vertical: IsVertical.bind(),
    children: systemtray.bind("items").as(i => i.map(SysTrayItem))
});

// #endregion

// #region Time

const Time = Widget.Box({
    vertical: IsVertical.bind(),
    homogeneous: true,
    spacing: 3,
    children: [
        Widget.Label({ label: Hour.bind() }),
        Widget.Label({ label: Minute.bind(), className: "accent" })
    ],

    // set class names to change when dashboard window is toggled
    setup: (self) => {
        self.hook(
            App,
            (self, windowName, visible) => {
                self.className =
                    "widget " +
                    (windowName == "dashboard" && visible ? "open" : "");
            },
            "window-toggled"
        );
    }
});

// #endregion

// #region Status icons

export const VolumeIcon = () => Widget.Label({
    label: audio.speaker.bind("is_muted").as(m => m ? "󰝟" : "󰕾"),
    // onMiddleClick: () => Utils.execAsync("pavucontrol"),
    // onPrimaryClick: () => audio.speaker.is_muted = !audio.speaker.is_muted
});

const BatIconsDischarging = ["󰁺", "󰁻", "󰁼", "󰁽", "󰁾", "󰁿", "󰂀", "󰂁", "󰂂", "󰁹"];
const BatIconCharging = "󰂄";
const BatIconCharged = "󱈑";

const BatIcon = Widget.Label({
    setup: (self) => self.hook(
        battery,
        (self) => {
            self.visible = battery.available;

            const state = battery.charged ? "charged" : battery.charging ? "charging" : "discharging";

            switch (state) {
                case "charging":
                    self.label = BatIconCharging;
                    break;
                case "charged":
                    self.label = BatIconCharged;
                    break;
                case "discharging":
                    const index = Math.floor(battery.percent / 100 * (BatIconsDischarging.length - 1));
                    if (BatIconsDischarging[index]) {
                        self.label = BatIconsDischarging[index];
                    }
                    break;
            }

            self.tooltipText = `${state}: ${battery.percent}%`;
            self.className = `${state}`;
        },
        "changed"
    )
});

const StatusIcons = Widget.Box({
    className: "widget",
    spacing: 4,
    vertical: IsVertical.bind(),
    children: [
        VolumeIcon(),
        BatIcon
    ]
})

// #endregion

// #region Toggle keyboard

const keyboardOpen = Variable(Utils.exec("pgrep -l 'wvkbd-mobintl'") != "");
function toggleKeyboard() {
    Utils.subprocess(
        ["bash", "-c", "~/.scripts/toggle_wvkbd.sh"],
        (output) => print(output),
        (err) => logError(err)
    );

    keyboardOpen.value = !keyboardOpen.value;
}

const TouchKeyboardButton = Widget.Button({
    on_clicked: toggleKeyboard,
    className: "widget",
    label: keyboardOpen.bind().as(o => o ? "󰌐" : "󰌌")
});

// #endregion

const BarWidgets = Widget.CenterBox({
    vertical: IsVertical.bind(),

    startWidget: Widget.Box({
        vertical: IsVertical.bind(),
        spacing: 10,
        children: [
            Widget.Label({ label: "" }),
            WorkspacesMain,
            WorkspacesSpecial,

            // expanding box to push above widgets to start
            Widget.Box({ vexpand: true, hexpand: true }),
        ]
    }),

    centerWidget: Widget.Box({
        spacing: 10,
        vertical: IsVertical.bind(),
        children: []
    }),

    endWidget: Widget.Box({
        spacing: 10,
        vertical: IsVertical.bind(),
        children: [
            // expanding box to push below widgets to end
            Widget.Box({ vexpand: true, hexpand: true }),

            TouchKeyboardButton,
            SysTray,
            StatusIcons,
            Time,
        ]
    })
});

// #region Bar window itself

const VertAnchor = ["left", "top", "bottom"];
const HorizAnchor = ["top", "left", "right"];

export const Bar = (monitor = 0) => Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: IsVertical.bind().as(v => v ? VertAnchor : HorizAnchor),
    exclusivity: "exclusive",
    child: Widget.Box({
        spacing: 20,
        homogeneous: true,
        vertical: IsVertical.bind(),
        className: "panel",
        css: "border-radius: 0px;",
        children: [
            BarWidgets
        ]
    }),
});

// #endregion
