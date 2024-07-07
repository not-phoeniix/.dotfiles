//
// main AGS config file :3
//

import { Bar, IsVertical } from "./js/bar.js";
import { QuickSettings } from "./js/quick_settings.js";
import { Dashboard } from "./js/dashboard.js";
import { ConfigWindow } from "./js/config_window.js";
import { SessionPopup } from "./js/session_popup.js";

const hyprland = await Service.import("hyprland");

const CachePath = Utils.exec(`bash -c "echo $HOME"`) + "/.cache/ags";
Utils.exec(`mkdir -p ${CachePath}`);

// #region Settings JSON writing/loading

const SettingsPath = CachePath + "/settings.json";

function WriteSettings() {
    const settingsObj = {
        IsVertical: IsVertical.value
    }

    const json = JSON.stringify(settingsObj);

    Utils.writeFile(json, SettingsPath);
    print("settings saved to \"" + SettingsPath + "\" :3");
}

function ReadSettings() {
    const json = Utils.readFile(SettingsPath);

    if (!json) {
        print("settings file at \"" + SettingsPath + "\" not found !!");
        return;
    }

    // parse settings string and set program values
    const settings = JSON.parse(Utils.readFile(SettingsPath));
    IsVertical.value = settings.IsVertical;

    // set hyprland anim style based on IsVertical variable
    const style = IsVertical.value ? "slidevert" : "slidehoriz";
    hyprland.messageAsync("keyword animation workspaces,1,3,default," + style);

    print("settings loaded from \"" + SettingsPath + "\" :3");
}

// make IsVertical write settings and set hyprland animation when changed
IsVertical.connect("changed", WriteSettings);

// load settings at startup
ReadSettings();

// #endregion

// #region CSS dynamic reloading upon file saving

function reloadStyling() {
    const scss = `${App.configDir}/style.scss`;
    const css = CachePath + "/style.css";
    Utils.exec(`sassc ${scss} ${css}`);

    App.resetCss();
    App.applyCss(css);
}

Utils.monitorFile(`${App.configDir}/style`, reloadStyling);
Utils.monitorFile(`${App.configDir}/style.scss`, reloadStyling);

reloadStyling();

// #endregion

App.config({
    windows: [
        Bar(0),
        QuickSettings,
        Dashboard,
        ConfigWindow,
        SessionPopup
    ]
});

App.closeWindow("quick_settings");
App.closeWindow("dashboard");
App.closeWindow("session_popup");
