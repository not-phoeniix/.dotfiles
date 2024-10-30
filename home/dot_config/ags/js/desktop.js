const hyprland = await Service.import("hyprland");

import { Hour, HourMilit, Minute } from "./variables.js";

const Name = Variable("[name]");
const SquareSize = Variable(250);
const SquareSpacing = Variable(20);
const WeatherUrlLatitude = Variable(0);
const WeatherUrlLongitude = Variable(0);

const DigitalClock = Widget.CenterBox({
    className: "desktop-widget digital-clock",
    widthRequest: SquareSize.bind(),
    heightRequest: SquareSize.bind(),
    centerWidget: Widget.Box({
        spacing: 10,
        children: [
            Widget.Label({ label: Hour.bind(), }),
            Widget.Label({ label: Minute.bind(), className: "accent" })
        ]
    })
});

const Greeter = Widget.CenterBox({
    className: "desktop-widget greeter",
    vertical: true,
    widthRequest: SquareSize.bind(),
    heightRequest: SquareSize.bind(),
    centerWidget: Widget.Box({
        spacing: 5,
        vertical: true,
        children: [
            Widget.Label({
                label: Name.bind().as(n => `Hello ${n} !!`),
                className: "greet-name"
            }),
            Widget.Label({
                className: "greet-time accent",
                label: HourMilit.bind().as(h => {
                    let hour = Number(h);
                    let time = "";
                    if (hour >= 22 || hour <= 3) {
                        // between 10pm and 3am, "night"
                        time = "Night";
                    } else if (hour >= 16) {
                        // >= 6pm, "evening"
                        time = "Evening";
                    } else if (hour >= 12) {
                        // >=noon, "afternoon"
                        time = "Afternoon";
                    } else {
                        // otherwise, "morning"
                        time = "Morning";
                    }

                    return `Good ${time} :]`
                })
            })
        ]
    })
});

const PokemonSearch = Widget.Box({
    className: "panel",
    widthRequest: SquareSize.bind(),
    heightRequest: SquareSize.bind(),
    vertical: true,
    setup: self => {
        const nameLabel = Widget.Label("[pokemon name]");
        const imageBox = Widget.Box({
            widthRequest: 200,
            heightRequest: 200,
            hexpand: false
        });

        const searchBox = Widget.Entry({
            hexpand: true,
            onAccept: ({ text }) => Utils.fetch(`https://pokeapi.co/api/v2/pokemon/${text}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Pokemon API response not ok !!!!!");
                    }
                    return response.json()
                }).then(data => {
                    Utils.fetch(data.forms[0].url).then(response => response.json()).then(form => {
                        nameLabel.label = `${form.name}: order ${form.order}`;
                        imageBox.css = `
                            background-image: url("${form.sprites.front_shiny}");
                            background-size: contain;
                        `;
                    });
                })
        });

        self.children = [
            imageBox,
            nameLabel,
            searchBox
        ];
    }
});

const Storage = () => {
    function getUsedPercent() {
        // get percentage used of root folder only second line, 
        //   regex to remove spaces and percent sign
        const output = Utils.exec(
            "df -h --output=pcent / | sed -n '2p'"
        ).replace(/\s\%/g, "");

        return Number(output);
    }

    const totalGigabytes = Variable(500);
    const usedGigabytes = Variable(10);
    const usedPercent = Variable(0.1);

    function updateStorage() {
        // grab output
        let output = Utils.exec(`bash -c "df -h --output=size,used,pcent / | sed -n '2p'"`);

        // turn all multiple spaces into a single space
        output = output.replace(/\s+/g, " ");
        // remove leading and trailing whitespace
        output = output.replace(/(^\s+|\s+$)/g, "");

        // split by matching only repeating numbers
        const split = output.match(/\d+/g);

        if (split) {
            totalGigabytes.value = Number(split[0]);
            usedGigabytes.value = Number(split[1]);
            usedPercent.value = Number(split[2]) / 100;
        }
    }

    updateStorage();
    Utils.interval(60_000 * 15, () => updateStorage);

    const progress = Widget.CircularProgress({
        css: SquareSize.bind().as(s => `
            min-width: ${s - 30}px;
            min-height: ${s - 30}px;
        `),
        startAt: 0.75,
        endAt: 0.75,
        rounded: true,
        value: usedPercent.bind()
    });

    return Widget.CenterBox({
        className: "desktop-widget",
        widthRequest: SquareSize.bind(),
        heightRequest: SquareSize.bind(),
        centerWidget: Widget.Overlay({
            child: progress,
            overlay: Widget.Box({
                vertical: true,
                vpack: "center",
                children: [
                    Widget.Label({
                        label: "󰋊",
                        className: "desktop-widget-icon"
                    }),
                    Widget.Label({
                        label: usedPercent.bind().as(u => `${u * 100}% used`),
                        className: "desktop-widget-desc"
                    }),
                    // Widget.Label({
                    //     label: usedGigabytes.bind().as(() =>
                    //         `${usedGigabytes.value}gb / ${totalGigabytes.value}gb`
                    //     ),
                    //     className: "desktop-widget-desc"
                    // })
                ]
            }),
        })
    });

};


const Weather = () => {
    const tempLabel = Widget.Label("temp: 20°F");
    const humidLabel = Widget.Label("humid: 0%");

    function refreshWeather() {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${WeatherUrlLatitude.value}&longitude=${WeatherUrlLongitude.value}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&forecast_days=3`;
        Utils.fetch(url)
            .then(res => res.json())
            .then(data => {
                tempLabel.label = `temp: ${data.current.temperature_2m}${data.current_units.temperature_2m}`;
                humidLabel.label = `humid: ${data.current.relative_humidity_2m}${data.current_units.relative_humidity_2m}`;
            });
    }

    return Widget.Box({
        className: "desktop-widget weather",
        widthRequest: SquareSize.bind(),
        heightRequest: SquareSize.bind(),
        vertical: true,
        children: [
            tempLabel,
            humidLabel
        ]
    })
        // weather refresh called every 15 min
        .poll(60_000 * 15, refreshWeather)
        .hook(WeatherUrlLongitude, refreshWeather)
        .hook(WeatherUrlLatitude, refreshWeather);
}

const WidgetCollection = Widget.Box({
    vpack: "start",
    hpack: "start",
    css: "margin: 30px;",
    spacing: SquareSpacing.bind(),
    vertical: true,
    children: [
        Widget.Box({
            spacing: SquareSpacing.bind(),
            children: [
                DigitalClock,
                Greeter,
            ]
        }),
        Widget.Box({
            homogeneous: false,
            child: Storage()
        }),
        // Weather()
    ]
});

export const DesktopWidgets = Widget.Window({
    monitor: 0,
    name: `desktop_widgets`,
    anchor: ["top", "bottom", "right", "left"],
    layer: "bottom",
    keymode: "on-demand",
    child: WidgetCollection,
    setup: self => {
        const Visible = Variable(false);

        function UpdateUnobstructed() {
            // make desktop widgets visible when either the focused client 
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
            if (hyprland.active.monitor.id == 0) {
                Visible.value = currentWorkspace?.windows == 0 || allAreFloating;
            }
        }

        // hook object's visible property to change whenever 
        //   the const Visible variable changes, and hook the
        //   updating function to trigger whenver hyprland updates
        self.hook(Visible, () => self.visible = Visible.value);
        self.hook(hyprland, UpdateUnobstructed);
    }
});

export function GetDesktopSettings() {
    return {
        name: Name.value,
        squareSize: SquareSize.value,
        squareSpacing: SquareSpacing.value,
        weatherUrlLatitude: WeatherUrlLatitude.value,
        weatherUrlLongitude: WeatherUrlLongitude.value
    };
}

export function LoadDesktopSettings(obj) {
    if (obj) {
        Name.value = obj.name || "[name]";
        SquareSize.value = obj.squareSize || 250;
        SquareSpacing.value = obj.squareSpacing || 20;
        WeatherUrlLatitude.value = obj.weatherUrlLatitude || 0;
        WeatherUrlLongitude.value = obj.weatherUrlLongitude || 0;
    }
}