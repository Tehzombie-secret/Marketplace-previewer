import { Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject, Observable, scheduled } from 'rxjs';
import { PLATFORM_TO_COLOR_STRATEGY } from '../../constants/platform-to-color-strategy.const';
import { APIPlatform } from '../api/models/api-platform.enum';
import { ToolbarState } from './models/toolbar-state.interface';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {

  private readonly state$ = new BehaviorSubject<ToolbarState>({ platform: null, platformColor: null, title: '' });

  getStateChanges(): Observable<ToolbarState> {
    return scheduled(this.state$.asObservable(), asyncScheduler);
  }

  getPlatform(): APIPlatform | null {
    return this.state$.getValue().platform;
  }

  setPlatform(platform: APIPlatform | null): void {
    const platformColor = platform ? (PLATFORM_TO_COLOR_STRATEGY[platform] ?? null) : null;
    const newState: ToolbarState = {
      ...this.state$.getValue(),
      platform,
      platformColor,
    };
    this.state$.next(newState);
  }

  setTitle(title: string): void {
    const newState: ToolbarState = {
      ...this.state$.getValue(),
      title,
    };
    this.state$.next(newState);
  }

}
