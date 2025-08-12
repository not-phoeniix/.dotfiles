import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import AstalHyprland from "gi://AstalHyprland";
import Settings, { Location } from "../extra/settings";
import { hour, minute } from "../extra/time";
import { networkIcon, batteryIcon, bluetoothIcon, volumeIcon } from "./icons";
import AstalTray from "gi://AstalTray";

const hyprland = AstalHyprland.get_default();
const tray = AstalTray.get_default();

// gets a combination of astal window anchor binds according to an inputted BarLocation
function getBarAnchor(location: Location) {
    switch (location) {
        case Location.TOP:
            return Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT;
        case Location.BOTTOM:
            return Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT;
        case Location.LEFT:
            return Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM;
        case Location.RIGHT:
            return Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM;
    }
}

// #region workspace widget things!!!!

// a singular workspace icon indicator/button
function wsIcon(workspace: number, hideIfNotExist: boolean = false, iconOverwrite: string = ""): JSX.Element {
    // function that runs to update the internals of a workspace icon 
    //   whenever something changes in hyprland
    function updateWsIcon(button: Widget.Button, wsNum: number, hideIfNotExist: boolean, icon: string) {
        const workspaceFocused = hyprland.get_focused_workspace().id === wsNum;
        const workspaceExists = hyprland.workspaces.some((ws) => ws.id === wsNum);

        button.toggleClassName("focused", workspaceFocused);
        button.label = icon != "" ? icon : workspaceExists ? "" : "";

        if (hideIfNotExist) {
            button.visible = workspaceExists;
        }
    }

    return <button
        onClick={() => hyprland.dispatch("workspace", `${workspace}`)}
        className="workspace"
        label={workspace.toString()}
        setup={(self) => {
            const update = () => updateWsIcon(self, workspace, hideIfNotExist, iconOverwrite);
            self.hook(hyprland, "event", update);
            update();
        }} />;
}

// all workspace icons collected together
function workspaces(): JSX.Element {
    return <box spacing={20} vertical={bind(Settings.barIsVertical)}>
        <box
            className="widget"
            css="padding: 4px;"
            homogeneous={true}
            vertical={bind(Settings.barIsVertical)}>
            {wsIcon(1)}
            {wsIcon(2)}
            {wsIcon(3)}
            {wsIcon(4)}
            {wsIcon(5)}
        </box>
        <box
            homogeneous={true}
            vertical={bind(Settings.barIsVertical)}>
            {wsIcon(6, true, "")}
            {wsIcon(7, true, "")}
            {wsIcon(8, true, "")}
        </box>
    </box>;
}

function focusedTitle() {
    const label = <label
        className="widget-label"
        maxWidthChars={40}
        truncate={true}
    /> as Widget.Label;

    label.hook(hyprland, "event", self => {
        self.label = hyprland.focusedClient?.title ?? "";
    });

    const visible = Variable.derive(
        [bind(label, "label"), Settings.barIsVertical],
        (l, v) => Boolean(l) && !v
    );

    return <box
        className="widget"
        visible={bind(visible)}>
        {label}
    </box>;
}

// #endregion

// #region time clock thingy :D 

function time(): JSX.Element {
    return <box className="widget">
        <box vertical={bind(Settings.barIsVertical)} spacing={8}>
            <label label={bind(hour)} />
            <label label={bind(minute)} className="accent" />
        </box>
    </box>;
}

// #endregion

// #region status icons / quick settings button

function statusIcons(quickMenu: Gtk.Window | null): JSX.Element {
    return <button
        className={quickMenu ? bind(quickMenu, "visible").as(v => `widget ${v ? "open" : ""}`) : "widget"}
        onClick={quickMenu ? () => quickMenu.visible = !quickMenu.visible : undefined}>
        <box vertical={bind(Settings.barIsVertical)} spacing={10}>
            {networkIcon("bar-status-icon")}
            {bluetoothIcon("bar-status-icon")}
            {volumeIcon("bar-status-icon")}
            {batteryIcon("bar-status-icon")}
        </box>
    </button>;
}

// #endregion

// #region notification history

function notifHistory(notifHistory: Gtk.Window | null): JSX.Element {
    return <button
        className={notifHistory ? bind(notifHistory, "visible").as(v => `widget ${v ? "open" : ""}`) : "widget"}
        onClick={notifHistory ? () => notifHistory.visible = !notifHistory.visible : undefined}>
        <label label="" className="widget-label" />
    </button>;
}

// #endregion

// #region system tray :]

function systemTray(): JSX.Element {
    function icon(item: AstalTray.TrayItem) {
        return <menubutton
            tooltipMarkup={bind(item, "tooltipMarkup")}
            className="tray-icon"
            usePopover={false}
            // ignore the error here, it's just a types error in @girs,, 
            //   itll get fixed in a newer commit at some point but this 
            //   runs fine dw
            actionGroup={bind(item, "actionGroup").as(group => ["dbusmenu", group])}
            menuModel={bind(item, "menuModel")}>
            <icon gicon={bind(item, "gicon")} />
        </menubutton>;
    }

    return <box
        className="widget"
        visible={bind(tray, "items").as(items => items.length > 0)}
        vertical={bind(Settings.barIsVertical)}>
        {bind(tray, "items").as(items => items.map(icon))}
    </box>
}

// #endregion

function barWidgets(): JSX.Element {
    const quickMenuWindow = App.get_window("quickMenu");
    const notifHistoryWindow = App.get_window("notifHistory");

    return <box vertical={bind(Settings.barIsVertical)}>

        { /* start widget, workspace things */}
        <box vertical={bind(Settings.barIsVertical)} spacing={10}>
            {workspaces()}
            {focusedTitle()}

            { /* expanding box to push above widgets to the start */}
            <box vexpand={true} hexpand={true} />
        </box>

        { /* middle widget, empty */}
        <box vertical={bind(Settings.barIsVertical)} spacing={10}>
        </box>

        {/* end widget, control panel things */}
        <box vertical={bind(Settings.barIsVertical)} spacing={10}>
            { /* expanding box to push below widgets to the end */}
            <box vexpand={true} hexpand={true} />

            {systemTray()}
            {notifHistory(null)}
            {statusIcons(quickMenuWindow)}
            {time()}
        </box>

    </box>;
}

export default function (monitor: Gdk.Monitor, name: string): JSX.Element {
    return <window
        gdkmonitor={monitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        name={name}
        application={App}
        anchor={bind(Settings.barLocation).as(getBarAnchor)}>
        <box
            vertical={bind(Settings.barIsVertical)}
            className="panel"
            css="border-radius: 0px;"
            widthRequest={bind(Settings.barSize)}
            heightRequest={bind(Settings.barSize)}>
            {barWidgets()}
        </box>
    </window>;
}