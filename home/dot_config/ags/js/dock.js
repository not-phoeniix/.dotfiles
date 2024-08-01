const { query } = await Service.import("applications");
const hyprland = await Service.import("hyprland");

const Location = Variable("bottom");
const SettingsPath = Utils.exec(`bash -c "echo $XDG_CACHE_HOME"`) + "ags/dock.json";

const AppButton = (app, size) => Widget.Button({
    onClicked: () => {
        App.closeWindow("app_launcher");
        app.launch();
    },
    attribute: { app },
    tooltipText: app.name,
    child: Widget.Icon({ icon: app.iconName || "", size })
});

function ReloadSettings(appsBox) {
    // ensures there's SOME file there so no errors occurr with json parsing 
    const dirLsOutput = Utils.exec(`bash -c "ls ${SettingsPath} 2> /dev/null"`);
    if (dirLsOutput == "") {
        print(`dock settings file not found, writing new file to "${SettingsPath}"!!!`);

        // if no file found, make a new object and write the JSON to that file
        const contents = { "apps": [], "location": "bottom", "size": 60 };
        Utils.writeFile(JSON.stringify(contents), SettingsPath);
    }

    const fileString = Utils.readFile(SettingsPath);
    if (!fileString) {
        print("error! cannot read dock settings json file! wuh oh !!!! somethings wrong !!!!!!!!!!!!!!!");
        return;
    }

    // parse json object from file string
    const obj = JSON.parse(fileString);

    // if the apps array exists, map its contents onto a buncha app
    //   buttons, and then assign the inputted box's children to that 
    //   new array
    if (obj.apps) {
        const size = obj.size || 60;
        appsBox.children = obj.apps.map(a => AppButton(query(a)[0], size));
    }

    // if location is specified, set location
    if (obj.location) {
        Location.value = obj.location;
    }
}

export const Dock = (monitor = 0) => {
    const Unobstructed = Variable(false);
    const Hovered = Variable(false);
    const IsVisible = Utils.derive([Unobstructed, Hovered], (u, h) => u || h);
    const DrawBg = Utils.derive([Unobstructed, Hovered], (u, h) => !u && h);

    const Apps = Widget.Box({
        spacing: 10,
        vertical: Location.bind().as(l => l == "right" || l == "left"),
        visible: IsVisible.bind(),
        setup: self => {
            ReloadSettings(self);
            Utils.monitorFile(SettingsPath, () => ReloadSettings(self));
        }
    });

    const hoverTrig = Widget.EventBox({
        onHover: () => Hovered.value = true,
        setup: self => self.poll(4000, () => {
            // poll every 4 seconds to check if mouse is still hovered
            //   if not, change the variable to reflect that lol
            if (!self.is_focus && Hovered.value == true) {
                Hovered.value = false;
            }
        }),

        child: Widget.Box({
            className: DrawBg.bind().as(d => IsVisible.value ? d ? "panel" : "panel nobg" : ""),
            css: "margin: 10px;",
            heightRequest: Location.bind().as(l => l == "left" || l == "right" ? 300 : 0),
            widthRequest: Location.bind().as(l => l == "left" || l == "right" ? 0 : 300),
            child: Apps
        })
    });

    function UpdateUnobstructed() {
        // make dock visible when either the focused client 
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
        if (hyprland.active.monitor.id == monitor) {
            Unobstructed.value = currentWorkspace?.windows == 0 || allAreFloating;
        }
    }

    return Widget.Window({
        monitor,
        name: `dock${monitor}`,
        anchor: Location.bind().as(l => [l]),
        child: hoverTrig
    }).hook(hyprland, UpdateUnobstructed);
};
