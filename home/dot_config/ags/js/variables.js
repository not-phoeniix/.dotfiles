// date and time, polled for update every 5 seconds
export const Hour = Variable("0");
export const Minute = Variable("0");
export const Day = Variable("15");
export const Month = Variable("November");
export const Year = Variable("1987");
Utils.interval(5_000, () => {
    Hour.value = Utils.exec("date +%I");
    Minute.value = Utils.exec("date +%M");
    Day.value = Utils.exec("date +%d");
    Month.value = Utils.exec("date +%B");
    Year.value = Utils.exec("date +%Y");
});
