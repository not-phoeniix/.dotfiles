//
// taskbar file :]
//

const hyprland = await Service.import("hyprland");
const battery = await Service.import("battery");
const systemtray = await Service.import("systemtray");
const audio = await Service.import("audio");
const network = await Service.import("network");
const bluetooth = await Service.import("bluetooth");

import { Hour, Minute } from "./variables.js"

export const IsVertical = Variable(false)

IsVertical.connect("changed", (self) => {
    const style = self.value ? "slidevert" : "slidehoriz";
    hyprland.messageAsync("keyword animation workspaces,1,3,default," + style);
});

// #region Logo button

const LogoButton = Widget.Button({
    onClicked: () => App.toggleWindow("app_launcher"),
    className: "logo",
    label: ""
}).hook(App, (self, windowName, visible) => {
    if (windowName == "app_launcher") {
        self.toggleClassName("open", visible);
    }
}, "window-toggled");

// #endregion

// #region Workspaces

const WorkspaceIcon = (workspace, hideIfNotExist = false, icon = "") => Widget.Button({
    attribute: workspace,
    onClicked: () => hyprland.messageAsync(`dispatch workspace ${workspace}`)
}).hook(
    hyprland, (self) => {
        const wsFocused = hyprland.active.workspace.id === workspace;
        const workspaceExists = hyprland.workspaces.some((ws => ws.id === workspace));

        self.class_name = "workspace container " + (wsFocused ? "focused" : "");

        self.label = workspaceExists ? "" : "";
        if (icon != "") self.label = icon;

        if (hideIfNotExist) {
            self.visible = workspaceExists;
        }
    }
);

const WorkspacesMain = Widget.Box({
    className: "widget",
    vertical: IsVertical.bind(),
    children: Array.from({ length: 5 }, (_, i) => i + 1)
        .map(i => WorkspaceIcon(i))
});

const WorkspacesSpecial = Widget.Box({
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

const Time = Widget.Button({
    onClicked: () => App.toggleWindow("dashboard"),
    className: "widget",
    child: Widget.Box({
        vertical: IsVertical.bind(),
        homogeneous: true,
        spacing: 3,
        children: [
            Widget.Label({ label: Hour.bind() }),
            Widget.Label({ label: Minute.bind(), className: "accent" })
        ]
    }),
}).hook(App, (self, windowName, visible) => {
    if (windowName == "dashboard") {
        self.toggleClassName("open", visible);
    }
}, "window-toggled");

// #endregion

// #region Status icons

export const VolumeIcon = () => Widget.Label({
    label: audio.speaker.bind("is_muted").as(m => m ? "󰝟" : "󰕾"),
});

export const BatteryIcon = () => Widget.Label().hook(
    battery,
    (self) => {
        self.visible = battery.available;

        const state = battery.charged ? "charged" : battery.charging ? "charging" : "discharging";

        switch (state) {
            case "charging":
                self.label = "󰂄";
                break;
            case "charged":
                self.label = "󱈑";
                break;
            case "discharging":
                const icons = ["󱃍", "󰁻", "󰁼", "󰁽", "󰁾", "󰁿", "󰂀", "󰂁", "󰂂", "󰁹"];
                const index = Math.floor(battery.percent / 100 * (icons.length - 1));
                if (icons[index]) {
                    self.label = icons[index];
                }
                break;
        }

        self.tooltip_text = `${state}: ${battery.percent}%`;
        self.class_name = `${state}`;
        self.toggleClassName("critical", battery.percent < 15 && !battery.charging);
    }
);

const WifiIcon = () => Widget.Stack({
    children: {
        "disabled": Widget.Label("󰤮"),
        "connecting": Widget.Label("󰤫"),
        "disconnected": Widget.Label("󰤫"),
        "connected": Widget.Label({
            label: network.wifi.bind("strength").as(s => {
                const icons = ["󰤯", "󰤟", "󰤢", "󰤥", "󰤨"];
                const index = Math.floor((s / 100) * (icons.length - 1));
                return icons[index];
            }),
            visible:
                network.wifi.bind("enabled") &&
                network.wifi.bind("internet").as(i => i == "connected"),
        })
    },
}).hook(network.wifi, (self) => {
    self.shown = network.wifi.enabled ? network.wifi.internet : "disabled";
});

const WiredIcon = () => Widget.Stack({
    children: {
        "connected": Widget.Label("󰈁"),
        "connecting": Widget.Label("󰈂"),
        "disconnected": Widget.Label("󰈂"),
    },
    shown: network.wired.bind("internet")
});

export const NetworkIcon = () => Widget.Stack({
    children: {
        "wifi": WifiIcon(),
        "wired": WiredIcon()
    },
    shown: network.bind("primary").as(p => p || "wifi")
});

export const BluetoothIcon = () => Widget.Label().hook(bluetooth, (self) => {
    self.label = bluetooth.connected_devices.length > 0 ? "󰂱" : bluetooth.enabled ? "󰂯" : "󰂲";
});

const DbusEnabled = Variable(false);
Utils.interval(3_600_000, () => {
    DbusEnabled.value = Utils.exec(`pgrep -l "dbus-run-"`) == "";
});

const DbusIcon = () => Widget.Label({
    label: "󰀦",
    className: "critical",
    tooltipText: "WM not run thru dbus!",
    visible: DbusEnabled.bind()
});

const StatusIcons = Widget.Button({
    className: "widget status-icons",
    onClicked: () => App.toggleWindow("quick_settings"),
    child: Widget.Box({
        spacing: 15,
        vertical: IsVertical.bind(),
        children: [
            DbusIcon(),
            NetworkIcon(),
            BluetoothIcon(),
            VolumeIcon(),
            BatteryIcon()
        ]
    })
}).hook(
    App,
    (self, windowName, visible) => {
        if (windowName == "quick_settings") {
            self.toggleClassName("open", visible);
        }
    },
    "window-toggled"
);

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
    onClicked: toggleKeyboard,
    className: "widget",
    label: keyboardOpen.bind().as(o => o ? "󰌐" : "󰌌")
});

// #endregion

const BarWidgets = Widget.CenterBox({
    vertical: IsVertical.bind(),

    startWidget: Widget.Box({
        vertical: IsVertical.bind(),
        spacing: 20,
        children: [
            LogoButton,
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

export const Bar = (monitor = 0) => Widget.Window({
    monitor,
    name: `bar${monitor}`,
    anchor: IsVertical.bind().as(v => v ? ["left", "top", "bottom"] : ["top", "left", "right"]),
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
