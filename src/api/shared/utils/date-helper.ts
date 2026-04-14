import { Injectable } from '@nestjs/common';

@Injectable()
export class DateHelper {
  static readonly TIMEZONE = 'America/New_York';

  getOrlandoDate(): Date {
    const now = new Date();
    // Use Intl to get a string in Orlando time and parse it back to a Date object
    // This is a common way to get "local" time for a specific zone in JS
    const orlandoString = now.toLocaleString('en-US', { timeZone: DateHelper.TIMEZONE });
    return new Date(orlandoString);
  }

  formatToLocalYYYYMMDD(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: DateHelper.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  static getLocalDateString(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  static getLocalTime(date: Date = new Date()): Date {
    return date;
  }
}

