const { query } = await Service.import("applications");

const CurrentPage = Variable("favs");

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

const AppButton = (app) => Widget.Button({
    onClicked: () => {
        App.closeWindow("app_launcher");
        app.launch();
    },
    attribute: { app },
    tooltipText: app.name,
    child: Widget.Icon({ icon: app.iconName || "", size: 60 })
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

const AppGrid = ({ gridWidth = 5, spacing = 10, appsArray = [] }) => {
    const gridHeight = Math.ceil(appsArray.length / gridWidth);
    let children = [];

    for (let y = 0; y < gridHeight; y++) {
        let rowChildren = [];

        for (let x = 0; x < gridWidth; x++) {
            let index = y * gridWidth + x;
            let app = appsArray[index];

            if (app) {
                rowChildren[x] = AppButton(app);
            }
        }

        children[y] = Widget.Box({
            spacing: spacing,
            children: rowChildren
        });
    }

    return Widget.Box({
        spacing: spacing,
        child: Widget.Box({
            spacing: spacing,
            vertical: true,
            children: children
        })
    });
};

const SwitchButtons = () => Widget.Box({
    vertical: true,
    spacing: 10,
    children: [
        Widget.Button({ label: "", onClicked: () => CurrentPage.value = "favs" }),
        Widget.Button({ label: "", onClicked: () => CurrentPage.value = "search" })
    ]
});

const CachePath = Utils.exec(`bash -c "echo $HOME"`) + "/.cache/ags";
const FavsPath = CachePath + "/apps/favs.json";
const FavsPage = ({ width = 300, height = 300 }) => {
    const obj = JSON.parse(Utils.readFile(FavsPath));

    let children = [];

    for (let key in obj) {
        let appsArray = obj[key].map(a => query(a)[0]);

        children.push(Widget.Box({
            vertical: true,
            hpack: "center",
            spacing: 10,
            children: [
                Widget.Label({ label: key, className: "header" }),
                AppGrid({
                    gridWidth: 4,
                    spacing: 20,
                    appsArray: appsArray
                })
            ]
        }));
    }

    return Widget.Scrollable({
        hscroll: "never",
        css: `min-width: ${width}px; min-height: ${height}px;`,
        child: Widget.Box({
            vertical: true,
            spacing: 40,
            widthRequest: width,
            heightRequest: height,
            className: "widget",
            children: children
        })
    });
}

const Pages = ({ width = 300, height = 300 }) => Widget.Stack({
    children: {
        "favs": FavsPage({
            width: width,
            height: height
        }),

        "search": SearchLauncher({
            width: width,
            height: height,
            spacing: 12
        }),
    },
    shown: CurrentPage.bind()
});

export const AppLauncher = ({ width = 300, height = 300 }) => Widget.Window({
    monitor: 0,
    name: "app_launcher",
    keymode: "on-demand",
    anchor: ["top", "left"],
    child: Widget.Box({
        className: "panel",
        spacing: 10,
        css: "margin: 10px;",
        children: [
            SwitchButtons(),
            Pages({ width: width, height: height })
        ]
    })
}).keybind("Escape", () => App.closeWindow("app_launcher"));

//* ~~ functions used in the cli with wm to toggle launcher pages ~~

export const ToggleSearch = () => {
    CurrentPage.value = "search";
    App.toggleWindow("app_launcher");
}

export const ToggleFavs = () => {
    CurrentPage.value = "favs";
    App.toggleWindow("app_launcher");
}

globalThis.ToggleSearch = ToggleSearch;
globalThis.ToggleFavs = ToggleFavs;
