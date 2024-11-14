import { Greeter } from "./desktop_widgets/greeter.js";
import { DigitalClock } from "./desktop_widgets/clocks.js";
import { Storage, Battery } from "./desktop_widgets/system_info.js";
import { DesktopUnobstructed } from "./variables.js";
import { TwentyFourtyEight } from "./desktop_widgets/games.js";
import { Weather } from "./desktop_widgets/weather.js";

const Name = Variable("[name]");
const SquareSize = Variable(250);
const SquareSpacing = Variable(20);
const WeatherUrlLatitude = Variable(0);
const WeatherUrlLongitude = Variable(0);

// #region container building blocks

const DesktopContainer = (children) => Widget.Box({
    vpack: "start",
    hpack: "start",
    css: "margin: 30px;",
    spacing: SquareSpacing.bind(),
    vertical: true,
    children: children
});

// creates a small sub-group box to go either within a desktop 
//   container or another sub group
// 
// params:
//   vertical: boolean, whether or not sub group aligned vertically
//   children: array of widgets for children of this group
//   oppAxisGridSize: width of opposite axis in grid integers, 
//     if vertical this would be width, if horizontal this
//     would be height
const SubGroup = ({ vertical, children, oppAxisGridSize = 1 }) => {
    // set up bindable variable, either square size inputted 
    //   perpendicular size or a dynamic derivation depending 
    //   on number of children of this group
    //
    // these defaults work if group is horizontally aligned
    let Height = Utils.derive(
        [SquareSize],
        (size) => size * oppAxisGridSize
    );
    let Width = Utils.derive(
        [SquareSize, SquareSpacing],
        (size, spacing) => size * children.length + spacing * (children.length - 1)
    );

    // swap width and height if vertical
    if (vertical) {
        [Height, Width] = [Width, Height];
    }

    return Widget.Box({
        widthRequest: Width.bind(),
        heightRequest: Height.bind(),
        homogeneous: true,
        spacing: SquareSpacing.bind(),
        children: children
    })
}

// #endregion

const container = DesktopContainer([
    SubGroup({
        vertical: false,
        children: [Greeter(Name)]
    }),
    SubGroup({
        vertical: false,
        children: [DigitalClock(), Storage(SquareSize, 0.9)],
    }),
    SubGroup({
        vertical: false,
        children: [TwentyFourtyEight()],
        oppAxisGridSize: 2
    })
]);

export const DesktopWidgets = Widget.Window({
    monitor: 0,
    name: `desktop_widgets`,
    anchor: ["top", "bottom", "right", "left"],
    layer: "bottom",
    keymode: "on-demand",
    child: container,
    visible: DesktopUnobstructed.bind()
});

// #region settings loading functions

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

// #endregion