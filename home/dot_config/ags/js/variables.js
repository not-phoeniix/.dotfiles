const hyprland = await Service.import("hyprland");

// date and time, polled for update every 5 seconds
export const Hour = Variable("0");
export const HourMilit = Variable("0");
export const Minute = Variable("0");
export const Day = Variable("15");
export const Month = Variable("November");
export const Year = Variable("1987");
Utils.interval(5_000, () => {
    Hour.value = Utils.exec("date +%I");
    HourMilit.value = Utils.exec("date +%H");
    Minute.value = Utils.exec("date +%M");
    Day.value = Utils.exec("date +%d");
    Month.value = Utils.exec("date +%B");
    Year.value = Utils.exec("date +%Y");
});

// desktop unobstructed variable updated every time anything changes in hyprland
export const DesktopUnobstructed = Variable(false);
hyprland.connect("changed", () => {
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
        DesktopUnobstructed.value = currentWorkspace?.windows == 0 || allAreFloating;
    }
});
