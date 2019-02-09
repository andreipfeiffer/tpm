import moment from "moment";

export default {
  toInt(x) {
    var nr = parseInt(x);
    if (isNaN(nr)) {
      return 0;
    }
    return parseInt(x);
  },

  isDateFormat(str) {
    return /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/.test(str.trim());
  },

  statusList: Object.freeze([
    "on hold",
    "started",
    "almost done",
    "finished",
    "paid",
    "cancelled"
  ]),
  currencyList: Object.freeze(["RON", "EUR"]),

  getActiveStatusList() {
    return [this.statusList[0], this.statusList[1], this.statusList[2]];
  },

  getInactiveStatusList() {
    return [this.statusList[3], this.statusList[4], this.statusList[5]];
  },

  getRemainingWorkTime(_deadline) {
    var today = moment(),
      weekendDays = this.getWeekendDays(_deadline),
      // deadline always starts at 00:00
      // so we add 19 hours, to set the deadline to 7:00 PM that day
      deadline = moment(_deadline).add(19, "hours");

    this.setTodayHour(today);
    var timeLeft = moment.duration(deadline.diff(today), "ms");

    return {
      weekendDays: weekendDays,
      textTotal: timeLeft.humanize(true),
      daysWork: this.getRemainingDays(timeLeft, weekendDays)
    };
  },

  getPassedTime(_deadline) {
    var today = moment(),
      weekendDays = this.getWeekendDays(_deadline),
      deadline = moment(_deadline);

    var timeLeft = moment.duration(deadline.diff(today), "ms");

    return {
      textTotal: timeLeft.humanize(true),
      daysWork: this.getRemainingDays(timeLeft, weekendDays)
    };
  },

  getWeekendDays(_deadline) {
    var nr = 0,
      dateStart = moment(),
      dateEnd = moment(_deadline);

    if (dateStart.isAfter(dateEnd, "day")) {
      return -1;
    }

    while (!dateStart.isAfter(dateEnd, "day")) {
      if (dateStart.day() === 6 || dateStart.day() === 0) {
        nr += 1;
      }
      dateStart.add(1, "days");
    }

    return nr;
  },

  getRemainingDays(timeLeft, weekendDays) {
    if (weekendDays > 0) {
      return timeLeft.subtract(weekendDays, "days").asDays();
    }

    // if weekendDays is -1, we don't substract
    return timeLeft.asDays();
  },

  /**
   * If the current day passed 14:00 o'clock, consider the day "finished",
   * otherwise, consider still available.
   *
   * @param  {Object Moment}   today   current day object
   */
  setTodayHour(today) {
    var h = 10;
    if (today.hour() > 14) {
      h = 19;
    }
    today.hour(h);
  }
};
