const { query } = await Service.import("applications");

const AppEntry = (app) => Widget.Button({
    onClicked: () => {
        App.closeWindow("app_launcher");
        app.launch();
    },
    attribute: { app },
    child: Widget.Box({
        spacing: 20,
        children: [
            Widget.Icon({
                icon: app.iconName || "",
                size: 42
            }),
            Widget.Label({
                label: app.name
            })
        ]
    })
});

const SearchLauncher = ({ width = 200, height = 300, spacing = 12 }) => {
    // define alphabetical/launch freq sort rules
    function sortRules(a, b) {
        // if same frequency, sort alphabetically
        if (a.frequency == b.frequency) {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        }

        // if different frequency, sort based on which frequency is higher
        if (a.frequency < b.frequency) return 1;
        if (a.frequency > b.frequency) return -1;
        return 0;
    }

    // map all apps queried to entries array, put inside vertical box
    let apps = query("").sort(sortRules).map(AppEntry);
    const list = Widget.Box({
        vertical: true,
        children: apps,
        spacing: spacing
    });

    function repopulate() {
        apps = query("").sort(sortRules).map(AppEntry);
        list.children = apps;
    }

    // create search box
    const searchBox = Widget.Entry({
        hexpand: true,
        className: "widget open",

        onAccept: () => {
            const results = apps.filter((item) => item.visible);
            if (results[0]) {
                App.closeWindow("app_launcher");
                results[0].attribute.app.launch();
            }
        },

        onChange: ({ text }) => apps.forEach((item) => {
            item.visible = item.attribute.app.match(text ?? "");
        })
    });

    // assemble and return final box
    return Widget.Box({
        vertical: true,
        className: "widget",
        spacing: spacing * 2,
        children: [
            Widget.Scrollable({
                hscroll: "never",
                css: `min-width: ${width}px; min-height: ${height}px;`,
                child: list
            }),
            searchBox
        ]
    }).hook(App, (_, windowName, visible) => {
        if (windowName == "app_launcher" && visible) {
            repopulate();
            searchBox.text = "";
            searchBox.grab_focus();
        }
    }, "window-toggled");
}

export const AppLauncher = ({ width = 300, height = 300 }) => Widget.Window({
    monitor: 0,
    name: "app_launcher",
    keymode: "on-demand",
    anchor: ["bottom"],
    child: Widget.Box({
        className: "panel",
        spacing: 10,
        css: "margin: 10px;",
        child: SearchLauncher({
            width: width,
            height: height,
            spacing: 12
        })
    })
}).keybind("Escape", () => App.closeWindow("app_launcher"));
