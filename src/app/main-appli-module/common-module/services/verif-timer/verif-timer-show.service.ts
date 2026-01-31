import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VerifTimerShowService {

  public convertTimerInSecond(timer: string | undefined): number {
    if (timer) {
      const [hour, minute, second] = this.getGoodFormat(timer).split(':');
      const totalSeconds = parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second);
      return totalSeconds;
    } else {
      return 0;
    }
  }

  public convertSecondInGoodFormatTimer(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  public extractHourAndMinute(duration: number | undefined): string {
    if (duration) {
      const totalSeconds = duration / 10_000_000;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const formattedMinutes = String(minutes).padStart(2, '0');
      return `${hours}h ${formattedMinutes}min`;
    } else {
      return '0h 00min';
    }
  }

  public getFormatEpisode(duration: number | undefined): string {
    if (!duration) return '0min';

    const totalSeconds = duration / 10_000_000;

    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return `${days}j ${remainingHours}h`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}min`;
    } else {
      return `${minutes}min`;
    }
  }

  public getGoodFormat(time: string): string {
    let timerTab: string[] = [];
    if (time && time != undefined) {
      timerTab = time.split(':');
    }
    if (timerTab.length === 3) {
      return time;
    } else {
      return '00:00:00';
    }
  }

  public converSecondInFormatToStream(time: number): string {
    const totalSeconds = Math.round(time);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }

}
