export default function getDateTimeType(include_date, include_time) {
  if (include_date && include_time) {
    return "dateTime";
  } else if (include_date) {
    return "date";
  } else if (include_time) {
    return "time";
  }
}
