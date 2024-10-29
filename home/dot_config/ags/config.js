//
// main AGS config file :3
//

const CachePath = Utils.exec(`bash -c "echo $XDG_CACHE_HOME"`) + "ags";
Utils.exec(`mkdir -p ${CachePath}`);

import { Bar, IsVertical } from "./js/bar.js";
import { QuickSettings } from "./js/quick_settings.js";
import { Dashboard } from "./js/dashboard.js";
import { ConfigWindow } from "./js/config_window.js";
import { SessionPopup } from "./js/session_popup.js";
import { AppLauncher } from "./js/app_launcher.js";
import { Dock, GetDockSettings, LoadDockSettings } from "./js/dock.js";
import { Notifications } from "./js/notifications.js";
import { VolBrightBar } from "./js/vol_bright_bar.js";
import { DesktopWidgets, GetDesktopSettings, LoadDesktopSettings } from "./js/desktop.js";

const hyprland = await Service.import("hyprland");

// used so that writing and reading don't happen in response 
//   to each other (possibly resulting in an infinite loop D:)
let settingsAccessed = false;

// #region Settings JSON writing/loading

const SettingsPath = CachePath + "/settings.json";

function WriteSettings() {
    if (settingsAccessed) {
        return;
    }

    settingsAccessed = true;

    const settingsObj = {
        isVertical: IsVertical.value,
        desktop: GetDesktopSettings(),
        dock: GetDockSettings()
    };

    const json = JSON.stringify(settingsObj, null, 4);

    Utils.writeFile(json, SettingsPath);
    print("settings saved to \"" + SettingsPath + "\" :3");

    settingsAccessed = false;
}

function ReadSettings() {
    if (settingsAccessed) {
        return;
    }

    settingsAccessed = true;

    const json = Utils.readFile(SettingsPath);

    if (!json) {
        print("settings file at \"" + SettingsPath + "\" not found !!");
        return;
    }

    // parse settings string and set program values
    const settings = JSON.parse(json);
    IsVertical.value = settings.isVertical;
    LoadDesktopSettings(settings.desktop);
    LoadDockSettings(settings.dock);

    // set hyprland anim style based on IsVertical variable
    const style = IsVertical.value ? "slidevert" : "slidehoriz";
    hyprland.messageAsync("keyword animation workspaces,1,3,default," + style);

    print("settings loaded from \"" + SettingsPath + "\" :3");

    settingsAccessed = false;
}

// load settings at startup
ReadSettings();

// set up connections so settings are written when is vertical 
//   changes and things are loaded when the file itself changes
IsVertical.connect("changed", WriteSettings);
Utils.monitorFile(SettingsPath, ReadSettings);

// #endregion

// #region CSS dynamic reloading upon file saving

function ReloadStyling() {
    const scss = `${App.configDir}/style.scss`;
    const css = CachePath + "/style.css";
    Utils.exec(`sassc ${scss} ${css}`);

    App.resetCss();
    App.applyCss(css);
}

Utils.monitorFile(`${App.configDir}/style`, ReloadStyling);
Utils.monitorFile(`${App.configDir}/style.scss`, ReloadStyling);

ReloadStyling();

// #endregion

App.config({
    windows: [
        Bar(0),
        QuickSettings,
        Dashboard,
        ConfigWindow,
        SessionPopup,
        AppLauncher({ width: 450, height: 500 }),
        Dock,
        Notifications({ width: 350, maxNotifs: 10, monitor: 0 }),
        VolBrightBar(0),
        DesktopWidgets
    ]
});

App.closeWindow("quick_settings");
App.closeWindow("dashboard");
App.closeWindow("session_popup");
App.closeWindow("app_launcher");
