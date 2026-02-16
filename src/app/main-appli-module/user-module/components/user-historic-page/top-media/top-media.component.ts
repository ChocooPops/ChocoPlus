import { Component, OnInit, Input } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { UserHistoricService } from '../../../service/user-historic/user-historic.service';
import { TopMedia } from '../../../dto/user-historic/top-media.interface';
import { TopMediaResponse } from '../../../dto/user-historic/top-media-response.interface';

@Component({
  standalone: true,
  selector: 'app-top-media',
  templateUrl: './top-media.component.html',
  styleUrls: ['./top-media.component.scss'],
  imports: [NgIf, NgFor]
})
export class TopMediaComponent implements OnInit {

  @Input() userId!: number;

  topMediaData: TopMediaResponse | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(private userHistoricService: UserHistoricService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.userHistoricService.getUserTopMedia(this.userId).subscribe({
      next: (data) => {
        this.topMediaData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du top 10';
        this.loading = false;
      }
    });
  }

  getPosterUrl(media: TopMedia): string {
    if (media.posterName) {
      return `${media.posterName}`;
    }
    return '/assets/placeholder-poster.png';
  }

  getMediaIcon(mediaType: string): string {
    return mediaType === 'MOVIE' ? '🎥' : '📺';
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-default';
  }

  getRankColor(rank: number): string {
    if (rank === 1) return '#FFD700'; // Or
    if (rank === 2) return '#C0C0C0'; // Argent
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#FFD81F'; // Jaune par défaut
  }

  refresh(): void {
    this.loadData();
  }

}