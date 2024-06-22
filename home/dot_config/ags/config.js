import { Bar, IsVertical } from "./widgets/bar.js";
import { CtrlPanel } from "./widgets/ctrl_panel.js";
import { Dashboard } from "./widgets/dashboard.js"

// #region Settings JSON writing/loading

const SettingsPath = "/tmp/desktop_settings.json";

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
    const css = "/tmp/ags-style-compiled.css";
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
        CtrlPanel(0),
        Dashboard()
    ]
});

App.closeWindow("ctrl_panel");
App.closeWindow("dashboard");
