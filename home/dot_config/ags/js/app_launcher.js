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

const Launcher = ({ width = 500, height = 500, spacing = 12 }) => {
    // define alphabetical sort rules
    function sortRules(a, b) {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
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
        css: `margin-bottom: ${spacing * 2}px;`,

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
        children: [
            searchBox,
            Widget.Scrollable({
                hscroll: "never",
                css: `min-width: ${width}px; min-height: ${height}px;`,
                child: list
            })
        ]
    }).hook(App, (_, windowName, visible) => {
        if (windowName == "app_launcher" && visible) {
            repopulate();
            searchBox.text = "";
            searchBox.grab_focus();
        }
    }, "window-toggled");
}

const Favorites = (appsArray) => {
}

const SwitchButtons = Widget.Box({
    vertical: true,
    homogeneous: true,
    children: [
        Widget.Button({ label: "h" }),
        Widget.Button({ label: "w" }),
        Widget.Button({ label: "s" })
    ]
});

const Pages = Widget.Stack({
    children: {
        "search": Launcher({ width: 300, height: 500, spacing: 12 })
    },
    shown: "search"
});

export const AppLauncher = Widget.Window({
    monitor: 0,
    name: "app_launcher",
    keymode: "on-demand",
    anchor: ["top", "left"],
    child: Widget.Box({
        className: "panel",
        css: "margin: 10px;",
        spacing: 10,
        children: [
            SwitchButtons,
            Pages
        ]
    })
}).keybind("Escape", () => App.closeWindow("app_launcher"));
