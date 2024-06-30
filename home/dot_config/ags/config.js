import { Bar, IsVertical } from "./js/bar.js";
import { QuickSettings } from "./js/quick_settings.js";
import { Dashboard } from "./js/dashboard.js"
import { FreakingGuys } from "./js/freaking_guys.js"
import { ConfigWindow } from "./js/config_window.js"

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

    const settings = JSON.parse(Utils.readFile(SettingsPath));
    IsVertical.value = settings.IsVertical;
    print("settings loaded from \"" + SettingsPath + "\" :3");
}

// set up variables to write settings when they change
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

// #region Freaking guys config reading

const guysPath = App.configDir + "/guys.json";
const guysJsonString = Utils.readFile(guysPath);
const guys = guysJsonString ? JSON.parse(guysJsonString) : [];

// #endregion

App.config({
    windows: [
        Bar(0),
        QuickSettings,
        Dashboard,
        FreakingGuys(guys),
        ConfigWindow
    ]
});

App.closeWindow("quick_settings");
App.closeWindow("dashboard");
App.closeWindow("freaking_guys");
