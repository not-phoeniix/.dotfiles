import { exec, monitorFile, readFile, Variable, writeFile } from "astal";
import { Astal } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";
import paths from "./paths";
const hyprland = AstalHyprland.get_default();

// #region settings variables

export enum Location { TOP, LEFT, RIGHT, BOTTOM }

// bar location variables, bindable
const barLocation: Variable<Location> = Variable(Location.LEFT);
const barIsVertical: Variable<boolean> = Variable.derive(
    [barLocation],
    loc => loc === Location.LEFT || loc === Location.RIGHT
);
// change hyprland animations when location changes
barLocation.subscribe((value) => {
    const style = (value === Location.LEFT || value === Location.RIGHT) ?
        "slidevert" :
        "slidehoriz";
    hyprland.message_async("keyword animation workspaces,1,3,default" + style, null);
});

const dockLocation: Variable<Location> = Variable(Location.BOTTOM);
const dockIsVertical: Variable<boolean> = Variable.derive(
    [dockLocation],
    loc => loc === Location.LEFT || loc === Location.RIGHT
);

// width/height of bar (on opposite axis depending if vertical)
const barSize = Variable(30);

const notifDnd = Variable(false);
const notifTimeout = Variable(8000);
const notifLocation = Variable(Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT);

// dock things
const dockApps: Variable<string[]> = Variable([])
const dockIconSize = Variable(45);

// wallpaper stuff
const wallpaperDir = Variable("");

// #endregion

// #region file saving/loading functions

// saves current settings of all values into a given JSON filepath
function saveSettings(path: string) {
    const fileObj = {
        barLocation: Location[barLocation.get()],
        barSize: barSize.get(),
        dockLocation: Location[dockLocation.get()],
        dockApps: dockApps.get(),
        dockIconSize: dockIconSize.get()
    };

    const pathDir = exec(["dirname", path]);
    exec(["mkdir", "-p", pathDir]);

    const objStr = JSON.stringify(fileObj, null, 4);
    writeFile(path, objStr);
    print(`wrote settings file to path! value:\n${objStr}`);
}

// loads settings from a given JSON file path, returns true if loaded correctly, false if not
function loadSettings(path: string): boolean {
    try {
        // get file contents, parse it to a json object
        const fileContents = readFile(path).trim();
        const fileObj = JSON.parse(fileContents);

        if (!fileObj) {
            throw "Cannot load settings from falsy json-parsed object!";
        }

        // bar location parsing
        if (fileObj.barLocation) {
            // get uppercase string
            let str: string = fileObj.barLocation;
            str = str?.toUpperCase();

            // iterate across all keys in location object, 
            // if string matches then set value 
            Object.keys(Location).forEach((s, i) => {
                if (str === Location[i]) {
                    barLocation.set(i);
                }
            });
        }

        // bar size parsing
        if (fileObj.barSize) {
            const size = fileObj.barSize as number;
            if (size) {
                barSize.set(size);
            }
        }

        // wallpaper dir parsing
        if (fileObj.wallpaperDir) {
            let dir = fileObj.wallpaperDir as string;
            if (dir) {
                // replace tilde with home path and repeating 
                //   slashes with just one slash
                dir = dir.replace(/^~/gi, paths.homeDir);
                dir = dir.replace(/\/+/gi, "/");
                wallpaperDir.set(dir);
            }
        }

        // dock app string array parsing
        if (fileObj.dockApps) {
            const appsArr = fileObj.dockApps as string[];
            if (appsArr) {
                dockApps.set(appsArr);
            }
        }

        // dock icon size parsing
        if (fileObj.dockIconSize) {
            const iconSize = fileObj.dockIconSize as number;
            if (iconSize) {
                dockIconSize.set(iconSize);
            }
        }

        // dock location parsing
        if (fileObj.dockLocation) {
            // get uppercase string
            let str: string = fileObj.dockLocation;
            str = str?.toUpperCase();

            // iterate across all keys in location object, 
            // if string matches then set value 
            Object.keys(Location).forEach((s, i) => {
                if (str === Location[i]) {
                    dockLocation.set(i);
                }
            });
        }

        print(`settings loaded from file [${path}]!`);

        return true;

    } catch (ex) {
        print(`EXCEPTION CAUGHT: ${ex}`);
        return false;
    }
}

if (!loadSettings(paths.settingsFile)) {
    print(`settings unable to be loaded from path [${paths.settingsFile}]... saving defaults...`);
    saveSettings(paths.settingsFile);
}

monitorFile(paths.settingsFile, () => loadSettings(paths.settingsFile));

// #endregion

export default {
    barLocation,
    barIsVertical,
    barSize,
    dockLocation,
    dockIsVertical,
    notifDnd,
    notifTimeout,
    notifLocation,
    dockApps,
    dockIconSize,
    wallpaperDir
};