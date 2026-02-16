import { Component, OnInit, Input } from '@angular/core';
import { WatchTimeStats } from '../../../dto/user-historic/watch-time-stats.interface';
import { UserHistoricService } from '../../../service/user-historic/user-historic.service';

@Component({
  standalone: true,
  selector: 'app-watch-time-stats',
  templateUrl: './watch-time-stats.component.html',
  styleUrls: ['./watch-time-stats.component.scss'],
  imports: []
})
export class WatchTimeStatsComponent implements OnInit {

  @Input() userId!: number;

  stats: WatchTimeStats | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private userHistoricService: UserHistoricService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.userHistoricService.getUserWatchTime(this.userId).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
      }
    });
  }

  formatTime(hours: number, minutes: number, seconds: number): string {
    const parts: string[] = [];
    
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}min`);
    }
    if (seconds > 0 && hours === 0) {
      parts.push(`${seconds}s`);
    }
    
    return parts.join(' ') || '0min';
  }

  formatTimeShort(hours: number, minutes: number): string {
    if (hours > 0) {
      const decimalMinutes = (minutes / 60).toFixed(1);
      return `${hours + parseFloat(decimalMinutes)}h`;
    }
    return `${minutes}min`;
  }

  refresh(): void {
    this.userHistoricService.resetUserWatchTime();
    this.loadStats();
  }
}