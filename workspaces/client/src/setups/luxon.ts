import { Settings } from 'luxon';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

declare module 'luxon' {
  interface TSSettings {
    throwOnInvalid: true;
  }
}

Settings.defaultZone = 'Asia/Tokyo';
Settings.throwOnInvalid = true;
