export class DateHelper {
  static readonly TIMEZONE = 'America/New_York';

  static getLocalDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  static getLocalTime(date: Date = new Date()): Date {
    // This is tricky because JS Dates are always UTC internally.
    // However, for TypeORM/MySQL timestamp columns, we usually want to send the date as it is.
    // Actually, it's better to let the database handle the conversion if possible, 
    // or just pass the JS Date and let the DB driver handle it.
    // The issue here was mainly the `attendanceDate` (string YYYY-MM-DD).
    return date;
  }
}
