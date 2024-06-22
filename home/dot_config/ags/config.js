import { Bar, IsVertical } from "./panels/bar.js";
import { CtrlPanel } from "./panels/ctrl_panel.js";
import { Dashboard } from "./panels/dashboard.js"
import { FreakingGuys } from "./panels/freaking_guys.js"

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

// #region Freaking guys cache reading

const guysPath = CachePath + "/guys.json";
const guysJsonString = Utils.readFile(guysPath);
const guys = guysJsonString ? JSON.parse(guysJsonString) : [];

// #endregion

App.config({
    windows: [
        Bar(0),
        CtrlPanel,
        Dashboard,
        FreakingGuys(guys),
    ]
});

App.closeWindow("ctrl_panel");
App.closeWindow("dashboard");
App.closeWindow("freaking_guys");
